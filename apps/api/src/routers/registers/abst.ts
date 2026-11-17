/**
 * AbSt Register Router (Antibiotic Sensitivity Testing)
 */

import { z } from 'zod'
import { eq, and, ilike, desc, count, gte, lte } from 'drizzle-orm'
import { orgAuthed, getDb, schema } from '../../procedures'
import { ORPCError } from '@orpc/server'
import {
  createAbstRegisterSchema,
  updateAbstRegisterSchema,
  abstRegisterFilterSchema,
} from '../../../../../packages/core/src/validators/registers/abst'

export const abstRegisterRouter = {
  list: orgAuthed
    .route({
      method: 'GET',
      path: '/registers/abst',
      summary: 'List AbSt registers',
      tags: ['Registers'],
    })
    .input(abstRegisterFilterSchema.optional())
    .output(z.object({ registers: z.array(z.any()), total: z.number() }))
    .handler(async ({ context, input }) => {
      const db = getDb(context)
      const conditions = [
        eq(schema.abstRegisters.organizationId, context.organization.id),
      ]

      if (input.dateFrom) {
        conditions.push(gte(schema.abstRegisters.date, input.dateFrom))
      }
      if (input.dateTo) {
        conditions.push(lte(schema.abstRegisters.date, input.dateTo))
      }
      if (input.ownerName) {
        conditions.push(
          ilike(schema.abstRegisters.ownerName, `%${input.ownerName}%`),
        )
      }
      if (input.species) {
        conditions.push(eq(schema.abstRegisters.species, input.species))
      }

      const registers = await db
        .select()
        .from(schema.abstRegisters)
        .where(and(...conditions))
        .orderBy(desc(schema.abstRegisters.createdAt))
        .limit(input.limit)
        .offset(input.offset)

      const [totalResult] = await db
        .select({ count: count() })
        .from(schema.abstRegisters)
        .where(and(...conditions))

      return { registers, total: totalResult?.count || 0 }
    }),

  get: orgAuthed
    .route({
      method: 'GET',
      path: '/registers/abst/:id',
      summary: 'Get AbSt register by ID',
      tags: ['Registers'],
    })
    .input(z.object({ id: z.string().uuid() }))
    .output(z.any())
    .handler(async ({ context, input }) => {
      const db = getDb(context)
      const [register] = await db
        .select()
        .from(schema.abstRegisters)
        .where(
          and(
            eq(schema.abstRegisters.id, input.id),
            eq(schema.abstRegisters.organizationId, context.organization.id),
          ),
        )
        .limit(1)

      if (!register) {
        throw new ORPCError('NOT_FOUND', { message: 'AbSt register not found' })
      }
      return register
    }),

  create: orgAuthed
    .route({
      method: 'POST',
      path: '/registers/abst',
      summary: 'Create AbSt register',
      tags: ['Registers'],
    })
    .input(createAbstRegisterSchema)
    .output(z.any())
    .handler(async ({ context, input }) => {
      const db = getDb(context)
      const [register] = await db
        .insert(schema.abstRegisters)
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
      path: '/registers/abst/:id',
      summary: 'Update AbSt register',
      tags: ['Registers'],
    })
    .input(z.object({ id: z.string().uuid(), data: updateAbstRegisterSchema }))
    .output(z.any())
    .handler(async ({ context, input }) => {
      const db = getDb(context)
      const [existing] = await db
        .select()
        .from(schema.abstRegisters)
        .where(
          and(
            eq(schema.abstRegisters.id, input.id),
            eq(schema.abstRegisters.organizationId, context.organization.id),
          ),
        )
        .limit(1)

      if (!existing) {
        throw new ORPCError('NOT_FOUND', { message: 'AbSt register not found' })
      }

      const [register] = await db
        .update(schema.abstRegisters)
        .set({
          ...input.data,
          updatedBy: context.user.id,
          updatedAt: new Date(),
        })
        .where(eq(schema.abstRegisters.id, input.id))
        .returning()

      return register
    }),

  delete: orgAuthed
    .route({
      method: 'DELETE',
      path: '/registers/abst/:id',
      summary: 'Delete AbSt register',
      tags: ['Registers'],
    })
    .input(z.object({ id: z.string().uuid() }))
    .output(z.object({ success: z.boolean() }))
    .handler(async ({ context, input }) => {
      const db = getDb(context)
      const [existing] = await db
        .select()
        .from(schema.abstRegisters)
        .where(
          and(
            eq(schema.abstRegisters.id, input.id),
            eq(schema.abstRegisters.organizationId, context.organization.id),
          ),
        )
        .limit(1)

      if (!existing) {
        throw new ORPCError('NOT_FOUND', { message: 'AbSt register not found' })
      }

      await db
        .delete(schema.abstRegisters)
        .where(eq(schema.abstRegisters.id, input.id))

      return { success: true }
    }),
}
