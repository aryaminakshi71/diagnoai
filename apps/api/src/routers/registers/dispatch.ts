/**
 * Dispatch Register Router
 */

import { z } from 'zod'
import { eq, and, ilike, desc, count, gte, lte } from 'drizzle-orm'
import { orgAuthed, getDb, schema } from '../../procedures'
import { ORPCError } from '@orpc/server'
import {
  createDispatchRegisterSchema,
  updateDispatchRegisterSchema,
  dispatchRegisterFilterSchema,
} from '../../../../../packages/core/src/validators/registers/dispatch'

export const dispatchRegisterRouter = {
  list: orgAuthed
    .route({
      method: 'GET',
      path: '/registers/dispatch',
      summary: 'List dispatch registers',
      tags: ['Registers'],
    })
    .input(dispatchRegisterFilterSchema.default({}))
    .output(z.object({ registers: z.array(z.any()), total: z.number() }))
    .handler(async ({ context, input }) => {
      const db = getDb(context)
      const conditions = [
        eq(schema.dispatchRegisters.organizationId, context.organization.id),
      ]

      if (input.dNo) {
        conditions.push(ilike(schema.dispatchRegisters.dNo, `%${input.dNo}%`))
      }
      if (input.dateFrom) {
        conditions.push(gte(schema.dispatchRegisters.date, input.dateFrom))
      }
      if (input.dateTo) {
        conditions.push(lte(schema.dispatchRegisters.date, input.dateTo))
      }
      if (input.to) {
        conditions.push(ilike(schema.dispatchRegisters.to, `%${input.to}%`))
      }

      const registers = await db
        .select()
        .from(schema.dispatchRegisters)
        .where(and(...conditions))
        .orderBy(desc(schema.dispatchRegisters.createdAt))
        .limit(input.limit)
        .offset(input.offset)

      const [totalResult] = await db
        .select({ count: count() })
        .from(schema.dispatchRegisters)
        .where(and(...conditions))

      return { registers, total: totalResult?.count || 0 }
    }),

  get: orgAuthed
    .route({
      method: 'GET',
      path: '/registers/dispatch/:id',
      summary: 'Get dispatch register by ID',
      tags: ['Registers'],
    })
    .input(z.object({ id: z.string().uuid() }))
    .output(z.any())
    .handler(async ({ context, input }) => {
      const db = getDb(context)
      const [register] = await db
        .select()
        .from(schema.dispatchRegisters)
        .where(
          and(
            eq(schema.dispatchRegisters.id, input.id),
            eq(
              schema.dispatchRegisters.organizationId,
              context.organization.id,
            ),
          ),
        )
        .limit(1)

      if (!register) {
        throw new ORPCError('NOT_FOUND', { message: 'Dispatch register not found' })
      }
      return register
    }),

  create: orgAuthed
    .route({
      method: 'POST',
      path: '/registers/dispatch',
      summary: 'Create dispatch register',
      tags: ['Registers'],
    })
    .input(createDispatchRegisterSchema)
    .output(z.any())
    .handler(async ({ context, input }) => {
      const db = getDb(context)
      const [register] = await db
        .insert(schema.dispatchRegisters)
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
      path: '/registers/dispatch/:id',
      summary: 'Update dispatch register',
      tags: ['Registers'],
    })
    .input(
      z.object({
        id: z.string().uuid(),
        data: updateDispatchRegisterSchema,
      }),
    )
    .output(z.any())
    .handler(async ({ context, input }) => {
      const db = getDb(context)
      const [existing] = await db
        .select()
        .from(schema.dispatchRegisters)
        .where(
          and(
            eq(schema.dispatchRegisters.id, input.id),
            eq(
              schema.dispatchRegisters.organizationId,
              context.organization.id,
            ),
          ),
        )
        .limit(1)

      if (!existing) {
        throw new ORPCError('NOT_FOUND', { message: 'Dispatch register not found' })
      }

      const [register] = await db
        .update(schema.dispatchRegisters)
        .set({
          ...input.data,
          updatedBy: context.user.id,
          updatedAt: new Date(),
        })
        .where(eq(schema.dispatchRegisters.id, input.id))
        .returning()

      return register
    }),

  delete: orgAuthed
    .route({
      method: 'DELETE',
      path: '/registers/dispatch/:id',
      summary: 'Delete dispatch register',
      tags: ['Registers'],
    })
    .input(z.object({ id: z.string().uuid() }))
    .output(z.object({ success: z.boolean() }))
    .handler(async ({ context, input }) => {
      const db = getDb(context)
      const [existing] = await db
        .select()
        .from(schema.dispatchRegisters)
        .where(
          and(
            eq(schema.dispatchRegisters.id, input.id),
            eq(
              schema.dispatchRegisters.organizationId,
              context.organization.id,
            ),
          ),
        )
        .limit(1)

      if (!existing) {
        throw new ORPCError('NOT_FOUND', { message: 'Dispatch register not found' })
      }

      await db
        .delete(schema.dispatchRegisters)
        .where(eq(schema.dispatchRegisters.id, input.id))

      return { success: true }
    }),
}
