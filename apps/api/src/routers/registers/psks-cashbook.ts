/**
 * PSKS Cashbook Register Router
 */

import { z } from 'zod'
import { eq, and, desc, count, gte, lte } from 'drizzle-orm'
import { orgAuthed, getDb, schema } from '../../procedures'
import { ORPCError } from '@orpc/server'
import {
  createPsksCashbookRegisterSchema,
  updatePsksCashbookRegisterSchema,
  psksCashbookRegisterFilterSchema,
} from '../../../../../packages/core/src/validators/registers/psks-cashbook'

export const psksCashbookRegisterRouter = {
  list: orgAuthed
    .route({
      method: 'GET',
      path: '/registers/psks-cashbook',
      summary: 'List PSKS cashbook registers',
      tags: ['Registers'],
    })
    .input(psksCashbookRegisterFilterSchema.optional())
    .output(z.object({ registers: z.array(z.any()), total: z.number() }))
    .handler(async ({ context, input }) => {
      const db = getDb(context)
      const conditions = [
        eq(
          schema.psksCashbookRegisters.organizationId,
          context.organization.id,
        ),
      ]

      if (input.dateFrom) {
        conditions.push(
          gte(schema.psksCashbookRegisters.date, input.dateFrom),
        )
      }
      if (input.dateTo) {
        conditions.push(lte(schema.psksCashbookRegisters.date, input.dateTo))
      }

      const registers = await db
        .select()
        .from(schema.psksCashbookRegisters)
        .where(and(...conditions))
        .orderBy(desc(schema.psksCashbookRegisters.createdAt))
        .limit(input.limit)
        .offset(input.offset)

      const [totalResult] = await db
        .select({ count: count() })
        .from(schema.psksCashbookRegisters)
        .where(and(...conditions))

      return { registers, total: totalResult?.count || 0 }
    }),

  get: orgAuthed
    .route({
      method: 'GET',
      path: '/registers/psks-cashbook/:id',
      summary: 'Get PSKS cashbook register by ID',
      tags: ['Registers'],
    })
    .input(z.object({ id: z.string().uuid() }))
    .output(z.any())
    .handler(async ({ context, input }) => {
      const db = getDb(context)
      const [register] = await db
        .select()
        .from(schema.psksCashbookRegisters)
        .where(
          and(
            eq(schema.psksCashbookRegisters.id, input.id),
            eq(
              schema.psksCashbookRegisters.organizationId,
              context.organization.id,
            ),
          ),
        )
        .limit(1)

      if (!register) {
        throw new ORPCError('NOT_FOUND', { message: 'PSKS cashbook register not found' })
      }
      return register
    }),

  create: orgAuthed
    .route({
      method: 'POST',
      path: '/registers/psks-cashbook',
      summary: 'Create PSKS cashbook register',
      tags: ['Registers'],
    })
    .input(createPsksCashbookRegisterSchema)
    .output(z.any())
    .handler(async ({ context, input }) => {
      const db = getDb(context)
      const [register] = await db
        .insert(schema.psksCashbookRegisters)
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
      path: '/registers/psks-cashbook/:id',
      summary: 'Update PSKS cashbook register',
      tags: ['Registers'],
    })
    .input(
      z.object({
        id: z.string().uuid(),
        data: updatePsksCashbookRegisterSchema,
      }),
    )
    .output(z.any())
    .handler(async ({ context, input }) => {
      const db = getDb(context)
      const [existing] = await db
        .select()
        .from(schema.psksCashbookRegisters)
        .where(
          and(
            eq(schema.psksCashbookRegisters.id, input.id),
            eq(
              schema.psksCashbookRegisters.organizationId,
              context.organization.id,
            ),
          ),
        )
        .limit(1)

      if (!existing) {
        throw new ORPCError('NOT_FOUND', { message: 'PSKS cashbook register not found' })
      }

      const [register] = await db
        .update(schema.psksCashbookRegisters)
        .set({
          ...input.data,
          updatedBy: context.user.id,
          updatedAt: new Date(),
        })
        .where(eq(schema.psksCashbookRegisters.id, input.id))
        .returning()

      return register
    }),

  delete: orgAuthed
    .route({
      method: 'DELETE',
      path: '/registers/psks-cashbook/:id',
      summary: 'Delete PSKS cashbook register',
      tags: ['Registers'],
    })
    .input(z.object({ id: z.string().uuid() }))
    .output(z.object({ success: z.boolean() }))
    .handler(async ({ context, input }) => {
      const db = getDb(context)
      const [existing] = await db
        .select()
        .from(schema.psksCashbookRegisters)
        .where(
          and(
            eq(schema.psksCashbookRegisters.id, input.id),
            eq(
              schema.psksCashbookRegisters.organizationId,
              context.organization.id,
            ),
          ),
        )
        .limit(1)

      if (!existing) {
        throw new ORPCError('NOT_FOUND', { message: 'PSKS cashbook register not found' })
      }

      await db
        .delete(schema.psksCashbookRegisters)
        .where(eq(schema.psksCashbookRegisters.id, input.id))

      return { success: true }
    }),
}
