/**
 * Stock Register Router
 */

import { z } from 'zod'
import { eq, and, ilike, desc, count, gte, lte } from 'drizzle-orm'
import { orgAuthed, getDb, schema } from '../../procedures'
import { ORPCError } from '@orpc/server'
import {
  createStockRegisterSchema,
  updateStockRegisterSchema,
  stockRegisterFilterSchema,
} from '../../../../../packages/core/src/validators/registers/stock'

export const stockRegisterRouter = {
  list: orgAuthed
    .route({
      method: 'GET',
      path: '/registers/stock',
      summary: 'List stock registers',
      tags: ['Registers'],
    })
    .input(stockRegisterFilterSchema.optional())
    .output(z.object({ registers: z.array(z.any()), total: z.number() }))
    .handler(async ({ context, input }) => {
      const db = getDb(context)
      const conditions = [
        eq(schema.stockRegisters.organizationId, context.organization.id),
      ]

      if (input.srNo) {
        conditions.push(eq(schema.stockRegisters.srNo, input.srNo))
      }
      if (input.particulars) {
        conditions.push(
          ilike(schema.stockRegisters.particulars, `%${input.particulars}%`),
        )
      }
      if (input.dateFrom) {
        conditions.push(gte(schema.stockRegisters.date, input.dateFrom))
      }
      if (input.dateTo) {
        conditions.push(lte(schema.stockRegisters.date, input.dateTo))
      }
      if (input.source) {
        conditions.push(ilike(schema.stockRegisters.source, `%${input.source}%`))
      }

      const registers = await db
        .select()
        .from(schema.stockRegisters)
        .where(and(...conditions))
        .orderBy(desc(schema.stockRegisters.createdAt))
        .limit(input.limit)
        .offset(input.offset)

      const [totalResult] = await db
        .select({ count: count() })
        .from(schema.stockRegisters)
        .where(and(...conditions))

      return { registers, total: totalResult?.count || 0 }
    }),

  get: orgAuthed
    .route({
      method: 'GET',
      path: '/registers/stock/:id',
      summary: 'Get stock register by ID',
      tags: ['Registers'],
    })
    .input(z.object({ id: z.string().uuid() }))
    .output(z.any())
    .handler(async ({ context, input }) => {
      const db = getDb(context)
      const [register] = await db
        .select()
        .from(schema.stockRegisters)
        .where(
          and(
            eq(schema.stockRegisters.id, input.id),
            eq(schema.stockRegisters.organizationId, context.organization.id),
          ),
        )
        .limit(1)

      if (!register) {
        throw new ORPCError('NOT_FOUND', { message: 'Stock register not found' })
      }
      return register
    }),

  create: orgAuthed
    .route({
      method: 'POST',
      path: '/registers/stock',
      summary: 'Create stock register',
      tags: ['Registers'],
    })
    .input(createStockRegisterSchema)
    .output(z.any())
    .handler(async ({ context, input }) => {
      const db = getDb(context)
      const [register] = await db
        .insert(schema.stockRegisters)
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
      path: '/registers/stock/:id',
      summary: 'Update stock register',
      tags: ['Registers'],
    })
    .input(z.object({ id: z.string().uuid(), data: updateStockRegisterSchema }))
    .output(z.any())
    .handler(async ({ context, input }) => {
      const db = getDb(context)
      const [existing] = await db
        .select()
        .from(schema.stockRegisters)
        .where(
          and(
            eq(schema.stockRegisters.id, input.id),
            eq(schema.stockRegisters.organizationId, context.organization.id),
          ),
        )
        .limit(1)

      if (!existing) {
        throw new ORPCError('NOT_FOUND', { message: 'Stock register not found' })
      }

      const [register] = await db
        .update(schema.stockRegisters)
        .set({
          ...input.data,
          updatedBy: context.user.id,
          updatedAt: new Date(),
        })
        .where(eq(schema.stockRegisters.id, input.id))
        .returning()

      return register
    }),

  delete: orgAuthed
    .route({
      method: 'DELETE',
      path: '/registers/stock/:id',
      summary: 'Delete stock register',
      tags: ['Registers'],
    })
    .input(z.object({ id: z.string().uuid() }))
    .output(z.object({ success: z.boolean() }))
    .handler(async ({ context, input }) => {
      const db = getDb(context)
      const [existing] = await db
        .select()
        .from(schema.stockRegisters)
        .where(
          and(
            eq(schema.stockRegisters.id, input.id),
            eq(schema.stockRegisters.organizationId, context.organization.id),
          ),
        )
        .limit(1)

      if (!existing) {
        throw new ORPCError('NOT_FOUND', { message: 'Stock register not found' })
      }

      await db
        .delete(schema.stockRegisters)
        .where(eq(schema.stockRegisters.id, input.id))

      return { success: true }
    }),
}
