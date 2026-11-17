/**
 * Data Transfer Router
 * 
 * Allows transferring/copying data between registers
 */

import { z } from 'zod'
import { eq, and, inArray } from 'drizzle-orm'
import { orgAuthed, getDb, schema } from '../procedures'
import { ORPCError } from '@orpc/server'

const transferSchema = z.object({
  sourceRegister: z.enum(['opd', 'biochemistry', 'stock', 'entry', 'brucellaRbpt', 'brucellaSero', 'fmd', 'birdFlu', 'abst', 'dailyExpenditure', 'psksCashbook', 'psksEntry', 'ledger', 'dispatch', 'psksLedger', 'psksStock']),
  sourceId: z.string().uuid(),
  targetRegister: z.enum(['biochemistry', 'brucellaRbpt', 'brucellaSero', 'fmd', 'birdFlu']),
  preserveFields: z.array(z.string()).optional(),
})

const registerFieldMappings: Record<string, Record<string, string>> = {
  opd: {
    ownerName: 'ownerName',
    address: 'address',
    species: 'species',
    sampleCode: 'sampleCode',
  },
  biochemistry: {
    ownerName: 'ownerName',
    village: 'village',
    species: 'species',
    age: 'age',
    sex: 'sex',
  },
}

export const dataTransferRouter = {
  /**
   * Get available fields from source register for transfer
   */
  getTransferableFields: orgAuthed
    .route({
      method: 'GET',
      path: '/registers/transfer/fields/:registerType',
      summary: 'Get transferable fields for a register type',
      tags: ['Registers'],
    })
    .input(z.object({ registerType: z.string() }))
    .output(z.any())
    .handler(async ({ input }) => {
      const fields = registerFieldMappings[input.registerType] || {}
      return { fields, registerType: input.registerType }
    }),

  /**
   * Transfer data from source register to target register
   */
  transfer: orgAuthed
    .route({
      method: 'POST',
      path: '/registers/transfer',
      summary: 'Transfer/copy data between registers',
      tags: ['Registers'],
    })
    .input(transferSchema)
    .output(z.any())
    .handler(async ({ context, input }) => {
      const db = getDb(context)
      const { sourceRegister, sourceId, targetRegister, preserveFields = [] } = input

      let sourceData: any = null

      if (sourceRegister === 'opd') {
        const [result] = await db
          .select()
          .from(schema.opdRegisters)
          .where(and(
            eq(schema.opdRegisters.id, sourceId),
            eq(schema.opdRegisters.organizationId, context.organization.id)
          ))
          .limit(1)
        sourceData = result
      }

      if (!sourceData) {
        throw new ORPCError('NOT_FOUND', { message: 'Source record not found' })
      }

      const transferData: Record<string, any> = {
        organizationId: context.organization.id,
        createdBy: context.user.id,
        date: new Date(),
      }

      if (sourceRegister === 'opd' && targetRegister === 'biochemistry') {
        if (preserveFields.includes('ownerName') || preserveFields.length === 0) {
          transferData.ownerName = sourceData.ownerName
        }
        if (preserveFields.includes('village')) {
          transferData.village = sourceData.address
        }
        if (preserveFields.includes('species') || preserveFields.length === 0) {
          transferData.species = sourceData.species
        }
      }

      let targetTable: any
      let targetSchema: any

      switch (targetRegister) {
        case 'biochemistry':
          targetTable = schema.biochemistryRegisters
          break
        case 'brucellaRbpt':
          targetTable = schema.brucellaRbptRegisters
          break
        case 'brucellaSero':
          targetTable = schema.brucellaSeroRegisters
          break
        case 'fmd':
          targetTable = schema.fmdRegisters
          break
        case 'birdFlu':
          targetTable = schema.birdFluRegisters
          break
        default:
          throw new ORPCError('BAD_REQUEST', { message: 'Unsupported target register' })
      }

      const [created] = await db
        .insert(targetTable)
        .values(transferData)
        .returning()

      return {
        success: true,
        transferredRecord: created,
        sourceRegister,
        targetRegister,
      }
    }),

  /**
   * Batch transfer multiple OPD records to test registers
   */
  batchTransfer: orgAuthed
    .route({
      method: 'POST',
      path: '/registers/transfer/batch',
      summary: 'Batch transfer OPD records to test registers',
      tags: ['Registers'],
    })
    .input(z.object({
      sourceIds: z.array(z.string().uuid()).min(1).max(50),
      targetRegister: z.enum(['biochemistry', 'brucellaRbpt', 'brucellaSero', 'fmd', 'birdFlu']),
    }))
    .output(z.object({
      success: z.boolean(),
      transferred: z.number(),
      failed: z.number(),
      errors: z.array(z.object({ id: z.string(), error: z.string() })).optional(),
    }))
    .handler(async ({ context, input }) => {
      const db = getDb(context)
      const { sourceIds, targetRegister } = input

      let transferred = 0
      const errors: { id: string; error: string }[] = []

      const sourceRecords = await db
        .select()
        .from(schema.opdRegisters)
        .where(and(
          eq(schema.opdRegisters.organizationId, context.organization.id),
          inArray(schema.opdRegisters.id, sourceIds)
        ))

      let targetTable: any

      switch (targetRegister) {
        case 'biochemistry':
          targetTable = schema.biochemistryRegisters
          break
        case 'brucellaRbpt':
          targetTable = schema.brucellaRbptRegisters
          break
        case 'brucellaSero':
          targetTable = schema.brucellaSeroRegisters
          break
        case 'fmd':
          targetTable = schema.fmdRegisters
          break
        case 'birdFlu':
          targetTable = schema.birdFluRegisters
          break
        default:
          throw new ORPCError('BAD_REQUEST', { message: 'Unsupported target register' })
      }

      for (const record of sourceRecords) {
        try {
          await db.insert(targetTable).values({
            organizationId: context.organization.id,
            createdBy: context.user.id,
            ownerName: record.ownerName,
            species: record.species,
            opdRegisterId: record.id,
          })
          transferred++
        } catch (error) {
          errors.push({
            id: record.id,
            error: error instanceof Error ? error.message : 'Unknown error',
          })
        }
      }

      return {
        success: true,
        transferred,
        failed: errors.length,
        errors: errors.length > 0 ? errors : undefined,
      }
    }),
}
