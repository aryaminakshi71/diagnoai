/**
 * OPD Register Router
 */

import { z } from 'zod'
import { eq, and, ilike, desc, count, gte, lte } from 'drizzle-orm'
import { orgAuthed, getDb, schema } from '../../procedures'
import { ORPCError } from '@orpc/server'
import {
  createOpdRegisterSchema,
  updateOpdRegisterSchema,
  opdRegisterFilterSchema,
} from '../../../../../packages/core/src/validators/registers/opd'

export const opdRegisterRouter = {
  list: orgAuthed
    .route({
      method: 'GET',
      path: '/registers/opd',
      summary: 'List OPD registers',
      tags: ['Registers'],
    })
    .input(opdRegisterFilterSchema.optional())
    .output(z.object({ registers: z.array(z.any()), total: z.number() }))
    .handler(async ({ context, input }) => {
      const db = getDb(context)
      const conditions = [
        eq(schema.opdRegisters.organizationId, context.organization.id),
      ]

      if (input.dateFrom) {
        conditions.push(gte(schema.opdRegisters.date, input.dateFrom))
      }
      if (input.dateTo) {
        conditions.push(lte(schema.opdRegisters.date, input.dateTo))
      }
      if (input.ownerName) {
        conditions.push(
          ilike(schema.opdRegisters.ownerName, `%${input.ownerName}%`),
        )
      }
      if (input.species) {
        conditions.push(eq(schema.opdRegisters.species, input.species))
      }

      const registers = await db
        .select()
        .from(schema.opdRegisters)
        .where(and(...conditions))
        .orderBy(desc(schema.opdRegisters.createdAt))
        .limit(input.limit)
        .offset(input.offset)

      const [totalResult] = await db
        .select({ count: count() })
        .from(schema.opdRegisters)
        .where(and(...conditions))

      return { registers, total: totalResult?.count || 0 }
    }),

  get: orgAuthed
    .route({
      method: 'GET',
      path: '/registers/opd/:id',
      summary: 'Get OPD register by ID',
      tags: ['Registers'],
    })
    .input(z.object({ id: z.string().uuid() }))
    .output(z.any())
    .handler(async ({ context, input }) => {
      const db = getDb(context)
      const [register] = await db
        .select()
        .from(schema.opdRegisters)
        .where(
          and(
            eq(schema.opdRegisters.id, input.id),
            eq(schema.opdRegisters.organizationId, context.organization.id),
          ),
        )
        .limit(1)

      if (!register) {
        throw new ORPCError('NOT_FOUND', { message: 'OPD register not found' })
      }
      return register
    }),

  create: orgAuthed
    .route({
      method: 'POST',
      path: '/registers/opd',
      summary: 'Create OPD register',
      tags: ['Registers'],
    })
    .input(createOpdRegisterSchema)
    .output(z.any())
    .handler(async ({ context, input }) => {
      const db = getDb(context)
      const [register] = await db
        .insert(schema.opdRegisters)
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
      path: '/registers/opd/:id',
      summary: 'Update OPD register',
      tags: ['Registers'],
    })
    .input(z.object({ id: z.string().uuid(), data: updateOpdRegisterSchema }))
    .output(z.any())
    .handler(async ({ context, input }) => {
      const db = getDb(context)
      const [existing] = await db
        .select()
        .from(schema.opdRegisters)
        .where(
          and(
            eq(schema.opdRegisters.id, input.id),
            eq(schema.opdRegisters.organizationId, context.organization.id),
          ),
        )
        .limit(1)

      if (!existing) {
        throw new ORPCError('NOT_FOUND', { message: 'OPD register not found' })
      }

      const [register] = await db
        .update(schema.opdRegisters)
        .set({
          ...input.data,
          updatedBy: context.user.id,
          updatedAt: new Date(),
        })
        .where(eq(schema.opdRegisters.id, input.id))
        .returning()

      return register
    }),

  delete: orgAuthed
    .route({
      method: 'DELETE',
      path: '/registers/opd/:id',
      summary: 'Delete OPD register',
      tags: ['Registers'],
    })
    .input(z.object({ id: z.string().uuid() }))
    .output(z.object({ success: z.boolean() }))
    .handler(async ({ context, input }) => {
      const db = getDb(context)
      const [existing] = await db
        .select()
        .from(schema.opdRegisters)
        .where(
          and(
            eq(schema.opdRegisters.id, input.id),
            eq(schema.opdRegisters.organizationId, context.organization.id),
          ),
        )
        .limit(1)

      if (!existing) {
        throw new ORPCError('NOT_FOUND', { message: 'OPD register not found' })
      }

      await db
        .delete(schema.opdRegisters)
        .where(eq(schema.opdRegisters.id, input.id))

      return { success: true }
    }),
}
