/**
 * Auto Populate Router
 * 
 * Provides auto-populate functionality when creating records from OPD
 */

import { z } from 'zod'
import { eq, and } from 'drizzle-orm'
import { orgAuthed, getDb, schema } from '../procedures'
import { ORPCError } from '@orpc/server'

export const autoPopulateRouter = {
  /**
   * Get OPD record for auto-population
   */
  getOpdForAutoPopulate: orgAuthed
    .route({
      method: 'GET',
      path: '/registers/autopopulate/opd/:id',
      summary: 'Get OPD record for auto-population',
      tags: ['Registers'],
    })
    .input(z.object({ id: z.string().uuid() }))
    .output(z.object({
      id: z.string(),
      date: z.string(),
      ownerName: z.string().nullable().optional(),
      address: z.string().nullable().optional(),
      species: z.string().nullable().optional(),
      sampleCode: z.string().nullable().optional(),
      testPerformed: z.string().nullable().optional(),
      linkedBiochemistry: z.boolean(),
      linkedBrucellaRbpt: z.boolean(),
      linkedBrucellaSero: z.boolean(),
      linkedFmd: z.boolean(),
      linkedBirdFlu: z.boolean(),
    }))
    .handler(async ({ context, input }) => {
      const db = getDb(context)
      
      const [opdRecord] = await db
        .select()
        .from(schema.opdRegisters)
        .where(
          and(
            eq(schema.opdRegisters.id, input.id),
            eq(schema.opdRegisters.organizationId, context.organization.id),
          ),
        )
        .limit(1)

      if (!opdRecord) {
        throw new ORPCError('NOT_FOUND', { message: 'OPD register not found' })
      }

      const [biochemistryRecord] = await db
        .select({ id: schema.biochemistryRegisters.id })
        .from(schema.biochemistryRegisters)
        .where(eq(schema.biochemistryRegisters.opdRegisterId, opdRecord.id))
        .limit(1)

      return {
        id: opdRecord.id,
        date: opdRecord.date,
        ownerName: opdRecord.ownerName,
        address: opdRecord.address,
        species: opdRecord.species,
        sampleCode: opdRecord.sampleCode,
        testPerformed: opdRecord.testPerformed,
        linkedBiochemistry: !!biochemistryRecord,
        linkedBrucellaRbpt: false,
        linkedBrucellaSero: false,
        linkedFmd: false,
        linkedBirdFlu: false,
      }
    }),

  /**
   * Search OPD records for linking
   */
  searchOpdForLinking: orgAuthed
    .route({
      method: 'GET',
      path: '/registers/autopopulate/opd/search',
      summary: 'Search OPD records for linking',
      tags: ['Registers'],
    })
    .input(z.object({
      query: z.string().min(1),
      excludeLinked: z.boolean().optional().default(false),
    }))
    .output(z.array(z.object({
      id: z.string(),
      date: z.string(),
      ownerName: z.string().nullable().optional(),
      species: z.string().nullable().optional(),
      sampleCode: z.string().nullable().optional(),
      testPerformed: z.string().nullable().optional(),
    })))
    .handler(async ({ context, input }) => {
      const db = getDb(context)
      
      const results = await db
        .select({
          id: schema.opdRegisters.id,
          date: schema.opdRegisters.date,
          ownerName: schema.opdRegisters.ownerName,
          species: schema.opdRegisters.species,
          sampleCode: schema.opdRegisters.sampleCode,
          testPerformed: schema.opdRegisters.testPerformed,
        })
        .from(schema.opdRegisters)
        .where(
          and(
            eq(schema.opdRegisters.organizationId, context.organization.id),
          ),
        )
        .limit(20)

      return results.map(r => ({
        ...r,
        date: r.date,
      }))
    }),

  /**
   * Get linked records for an OPD
   */
  getLinkedRecords: orgAuthed
    .route({
      method: 'GET',
      path: '/registers/autopopulate/linked/:opdId',
      summary: 'Get all linked test records for an OPD',
      tags: ['Registers'],
    })
    .input(z.object({ opdId: z.string().uuid() }))
    .output(z.object({
      opd: z.any().optional(),
      biochemistry: z.array(z.any()).optional(),
      brucellaRbpt: z.array(z.any()).optional(),
      brucellaSero: z.array(z.any()).optional(),
      fmd: z.array(z.any()).optional(),
      birdFlu: z.array(z.any()).optional(),
    }))
    .handler(async ({ context, input }) => {
      const db = getDb(context)
      
      const [opdRecord] = await db
        .select()
        .from(schema.opdRegisters)
        .where(
          and(
            eq(schema.opdRegisters.id, input.opdId),
            eq(schema.opdRegisters.organizationId, context.organization.id),
          ),
        )
        .limit(1)

      if (!opdRecord) {
        throw new ORPCError('NOT_FOUND', { message: 'OPD register not found' })
      }

      const biochemistryRecords = await db
        .select()
        .from(schema.biochemistryRegisters)
        .where(eq(schema.biochemistryRegisters.opdRegisterId, opdRecord.id))

      return {
        opd: opdRecord,
        biochemistry: biochemistryRecords,
      }
    }),
}
