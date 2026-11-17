/**
 * Biochemistry Register Router
 */

import { z } from 'zod'
import { eq, and, ilike, desc, count, gte, lte } from 'drizzle-orm'
import { orgAuthed, getDb, schema } from '../../procedures'
import { ORPCError } from '@orpc/server'
import {
  createBiochemistryRegisterSchema,
  updateBiochemistryRegisterSchema,
  biochemistryRegisterFilterSchema,
  batchCreateBiochemistrySchema,
} from '../../../../../packages/core/src/validators/registers/biochemistry'

export const biochemistryRegisterRouter = {
  list: orgAuthed
    .route({
      method: 'GET',
      path: '/registers/biochemistry',
      summary: 'List biochemistry registers',
      tags: ['Registers'],
    })
    .input(biochemistryRegisterFilterSchema)
    .output(z.object({ registers: z.array(z.any()), total: z.number() }))
    .handler(async ({ context, input }) => {
      const db = getDb(context)
      const conditions = [
        eq(schema.biochemistryRegisters.organizationId, context.organization.id),
      ]

      if (input.dateFrom) {
        conditions.push(gte(schema.biochemistryRegisters.date, input.dateFrom))
      }
      if (input.dateTo) {
        conditions.push(lte(schema.biochemistryRegisters.date, input.dateTo))
      }
      if (input.ownerName) {
        conditions.push(
          ilike(schema.biochemistryRegisters.ownerName, `%${input.ownerName}%`),
        )
      }
      if (input.species) {
        conditions.push(eq(schema.biochemistryRegisters.species, input.species))
      }

      const registers = await db
        .select()
        .from(schema.biochemistryRegisters)
        .where(and(...conditions))
        .orderBy(desc(schema.biochemistryRegisters.createdAt))
        .limit(input.limit)
        .offset(input.offset)

      const [totalResult] = await db
        .select({ count: count() })
        .from(schema.biochemistryRegisters)
        .where(and(...conditions))

      return { registers, total: totalResult?.count || 0 }
    }),

  get: orgAuthed
    .route({
      method: 'GET',
      path: '/registers/biochemistry/:id',
      summary: 'Get biochemistry register by ID',
      tags: ['Registers'],
    })
    .input(z.object({ id: z.string().uuid() }))
    .output(z.any())
    .handler(async ({ context, input }) => {
      const db = getDb(context)
      const [register] = await db
        .select()
        .from(schema.biochemistryRegisters)
        .where(
          and(
            eq(schema.biochemistryRegisters.id, input.id),
            eq(
              schema.biochemistryRegisters.organizationId,
              context.organization.id,
            ),
          ),
        )
        .limit(1)

      if (!register) {
        throw new ORPCError('NOT_FOUND', { message: 'Biochemistry register not found' })
      }
      return register
    }),

  create: orgAuthed
    .route({
      method: 'POST',
      path: '/registers/biochemistry',
      summary: 'Create biochemistry register',
      tags: ['Registers'],
    })
    .input(createBiochemistryRegisterSchema)
    .output(z.any())
    .handler(async ({ context, input }) => {
      const db = getDb(context)
      const [register] = await db
        .insert(schema.biochemistryRegisters)
        .values({
          organizationId: context.organization.id,
          createdBy: context.user.id,
          ...input,
          date: input.date ?? new Date().toISOString().slice(0, 10),
        })
        .returning()
      return register
    }),

  update: orgAuthed
    .route({
      method: 'PATCH',
      path: '/registers/biochemistry/:id',
      summary: 'Update biochemistry register',
      tags: ['Registers'],
    })
    .input(
      z.object({
        id: z.string().uuid(),
        data: updateBiochemistryRegisterSchema,
      }),
    )
    .output(z.any())
    .handler(async ({ context, input }) => {
      const db = getDb(context)
      const [existing] = await db
        .select()
        .from(schema.biochemistryRegisters)
        .where(
          and(
            eq(schema.biochemistryRegisters.id, input.id),
            eq(
              schema.biochemistryRegisters.organizationId,
              context.organization.id,
            ),
          ),
        )
        .limit(1)

      if (!existing) {
        throw new ORPCError('NOT_FOUND', { message: 'Biochemistry register not found' })
      }

      const [register] = await db
        .update(schema.biochemistryRegisters)
        .set({
          ...input.data,
          updatedBy: context.user.id,
          updatedAt: new Date(),
        })
        .where(eq(schema.biochemistryRegisters.id, input.id))
        .returning()

      return register
    }),

  delete: orgAuthed
    .route({
      method: 'DELETE',
      path: '/registers/biochemistry/:id',
      summary: 'Delete biochemistry register',
      tags: ['Registers'],
    })
    .input(z.object({ id: z.string().uuid() }))
    .output(z.object({ success: z.boolean() }))
    .handler(async ({ context, input }) => {
      const db = getDb(context)
      const [existing] = await db
        .select()
        .from(schema.biochemistryRegisters)
        .where(
          and(
            eq(schema.biochemistryRegisters.id, input.id),
            eq(
              schema.biochemistryRegisters.organizationId,
              context.organization.id,
            ),
          ),
        )
        .limit(1)

      if (!existing) {
        throw new ORPCError('NOT_FOUND', { message: 'Biochemistry register not found' })
      }

      await db
        .delete(schema.biochemistryRegisters)
        .where(eq(schema.biochemistryRegisters.id, input.id))

      return { success: true }
    }),

  /**
   * Auto-populate from OPD register
   */
  createFromOpd: orgAuthed
    .route({
      method: 'POST',
      path: '/registers/biochemistry/from-opd/:opdId',
      summary: 'Create biochemistry record from OPD register',
      tags: ['Registers'],
    })
    .input(z.object({ opdId: z.string().uuid() }))
    .output(z.any())
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

      const [register] = await db
        .insert(schema.biochemistryRegisters)
        .values({
          organizationId: context.organization.id,
          createdBy: context.user.id,
          date: opdRecord.date,
          ownerName: opdRecord.ownerName,
          species: opdRecord.species,
          opdRegisterId: opdRecord.id,
        })
        .returning()

      return register
    }),

  /**
   * Batch create biochemistry records
   */
  batchCreate: orgAuthed
    .route({
      method: 'POST',
      path: '/registers/biochemistry/batch',
      summary: 'Batch create biochemistry records',
      tags: ['Registers'],
    })
    .input(batchCreateBiochemistrySchema)
    .output(
      z.object({
        created: z.number(),
        failed: z.number(),
        records: z.array(z.any()).optional(),
        errors: z.array(z.object({ index: z.number(), error: z.string() })).optional(),
      }),
    )
    .handler(async ({ context, input }) => {
      const db = getDb(context)
      const created: any[] = []
      const errors: { index: number; error: string }[] = []

      for (let i = 0; i < input.records.length; i++) {
        try {
          const [record] = await db
            .insert(schema.biochemistryRegisters)
            .values({
              organizationId: context.organization.id,
              createdBy: context.user.id,
              ...input.records[i],
              date: input.records[i].date ?? new Date().toISOString().slice(0, 10),
            })
            .returning()
          created.push(record)
        } catch (error) {
          errors.push({
            index: i,
            error: error instanceof Error ? error.message : 'Unknown error',
          })
        }
      }

      return {
        created: created.length,
        failed: errors.length,
        records: created.length > 0 ? created : undefined,
        errors: errors.length > 0 ? errors : undefined,
      }
    }),
}
