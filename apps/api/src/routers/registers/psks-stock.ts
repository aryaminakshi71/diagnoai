/**
 * PSKS Stock Register Router
 */

import { z } from 'zod'
import { eq, and, ilike, desc, count, gte, lte } from 'drizzle-orm'
import { orgAuthed, getDb, schema } from '../../procedures'
import { ORPCError } from '@orpc/server'
import {
  createPsksStockRegisterSchema,
  updatePsksStockRegisterSchema,
  psksStockRegisterFilterSchema,
} from '../../../../../packages/core/src/validators/registers/psks-stock'

export const psksStockRegisterRouter = {
  list: orgAuthed
    .route({
      method: 'GET',
      path: '/registers/psks-stock',
      summary: 'List PSKS stock registers',
      tags: ['Registers'],
    })
    .input(psksStockRegisterFilterSchema.default({}))
    .output(z.object({ registers: z.array(z.any()), total: z.number() }))
    .handler(async ({ context, input }) => {
      const db = getDb(context)
      const conditions = [
        eq(schema.psksStockRegisters.organizationId, context.organization.id),
      ]

      if (input.srNo) {
        conditions.push(eq(schema.psksStockRegisters.srNo, input.srNo))
      }
      if (input.particulars) {
        conditions.push(
          ilike(schema.psksStockRegisters.particulars, `%${input.particulars}%`),
        )
      }
      if (input.dateFrom) {
        conditions.push(gte(schema.psksStockRegisters.date, input.dateFrom))
      }
      if (input.dateTo) {
        conditions.push(lte(schema.psksStockRegisters.date, input.dateTo))
      }
      if (input.source) {
        conditions.push(
          ilike(schema.psksStockRegisters.source, `%${input.source}%`),
        )
      }

      const registers = await db
        .select()
        .from(schema.psksStockRegisters)
        .where(and(...conditions))
        .orderBy(desc(schema.psksStockRegisters.createdAt))
        .limit(input.limit)
        .offset(input.offset)

      const [totalResult] = await db
        .select({ count: count() })
        .from(schema.psksStockRegisters)
        .where(and(...conditions))

      return { registers, total: totalResult?.count || 0 }
    }),

  get: orgAuthed
    .route({
      method: 'GET',
      path: '/registers/psks-stock/:id',
      summary: 'Get PSKS stock register by ID',
      tags: ['Registers'],
    })
    .input(z.object({ id: z.string().uuid() }))
    .output(z.any())
    .handler(async ({ context, input }) => {
      const db = getDb(context)
      const [register] = await db
        .select()
        .from(schema.psksStockRegisters)
        .where(
          and(
            eq(schema.psksStockRegisters.id, input.id),
            eq(
              schema.psksStockRegisters.organizationId,
              context.organization.id,
            ),
          ),
        )
        .limit(1)

      if (!register) {
        throw new ORPCError('NOT_FOUND', { message: 'PSKS stock register not found' })
      }
      return register
    }),

  create: orgAuthed
    .route({
      method: 'POST',
      path: '/registers/psks-stock',
      summary: 'Create PSKS stock register',
      tags: ['Registers'],
    })
    .input(createPsksStockRegisterSchema)
    .output(z.any())
    .handler(async ({ context, input }) => {
      const db = getDb(context)
      const [register] = await db
        .insert(schema.psksStockRegisters)
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
      path: '/registers/psks-stock/:id',
      summary: 'Update PSKS stock register',
      tags: ['Registers'],
    })
    .input(
      z.object({
        id: z.string().uuid(),
        data: updatePsksStockRegisterSchema,
      }),
    )
    .output(z.any())
    .handler(async ({ context, input }) => {
      const db = getDb(context)
      const [existing] = await db
        .select()
        .from(schema.psksStockRegisters)
        .where(
          and(
            eq(schema.psksStockRegisters.id, input.id),
            eq(
              schema.psksStockRegisters.organizationId,
              context.organization.id,
            ),
          ),
        )
        .limit(1)

      if (!existing) {
        throw new ORPCError('NOT_FOUND', { message: 'PSKS stock register not found' })
      }

      const [register] = await db
        .update(schema.psksStockRegisters)
        .set({
          ...input.data,
          updatedBy: context.user.id,
          updatedAt: new Date(),
        })
        .where(eq(schema.psksStockRegisters.id, input.id))
        .returning()

      return register
    }),

  delete: orgAuthed
    .route({
      method: 'DELETE',
      path: '/registers/psks-stock/:id',
      summary: 'Delete PSKS stock register',
      tags: ['Registers'],
    })
    .input(z.object({ id: z.string().uuid() }))
    .output(z.object({ success: z.boolean() }))
    .handler(async ({ context, input }) => {
      const db = getDb(context)
      const [existing] = await db
        .select()
        .from(schema.psksStockRegisters)
        .where(
          and(
            eq(schema.psksStockRegisters.id, input.id),
            eq(
              schema.psksStockRegisters.organizationId,
              context.organization.id,
            ),
          ),
        )
        .limit(1)

      if (!existing) {
        throw new ORPCError('NOT_FOUND', { message: 'PSKS stock register not found' })
      }

      await db
        .delete(schema.psksStockRegisters)
        .where(eq(schema.psksStockRegisters.id, input.id))

      return { success: true }
    }),
}
