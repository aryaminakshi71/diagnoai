/**
 * FMD Register Router
 */

import { z } from 'zod'
import { eq, and, ilike, desc, count, gte, lte } from 'drizzle-orm'
import { orgAuthed, getDb, schema } from '../../procedures'
import { ORPCError } from '@orpc/server'
import {
  createFmdRegisterSchema,
  updateFmdRegisterSchema,
  fmdRegisterFilterSchema,
} from '../../../../../packages/core/src/validators/registers/fmd'

export const fmdRegisterRouter = {
  list: orgAuthed
    .route({
      method: 'GET',
      path: '/registers/fmd',
      summary: 'List FMD registers',
      tags: ['Registers'],
    })
    .input(fmdRegisterFilterSchema)
    .output(z.object({ registers: z.array(z.any()), total: z.number() }))
    .handler(async ({ context, input }) => {
      const db = getDb(context)
      const conditions = [
        eq(schema.fmdRegisters.organizationId, context.organization.id),
      ]

      if (input.sampleIdCryovialCode) {
        conditions.push(
          ilike(
            schema.fmdRegisters.sampleIdCryovialCode,
            `%${input.sampleIdCryovialCode}%`,
          ),
        )
      }
      if (input.dateOfSamplingFrom) {
        conditions.push(
          gte(schema.fmdRegisters.dateOfSampling, input.dateOfSamplingFrom),
        )
      }
      if (input.dateOfSamplingTo) {
        conditions.push(
          lte(schema.fmdRegisters.dateOfSampling, input.dateOfSamplingTo),
        )
      }
      if (input.ownerName) {
        conditions.push(
          ilike(schema.fmdRegisters.ownerName, `%${input.ownerName}%`),
        )
      }
      if (input.district) {
        conditions.push(eq(schema.fmdRegisters.district, input.district))
      }

      const registers = await db
        .select()
        .from(schema.fmdRegisters)
        .where(and(...conditions))
        .orderBy(desc(schema.fmdRegisters.createdAt))
        .limit(input.limit)
        .offset(input.offset)

      const [totalResult] = await db
        .select({ count: count() })
        .from(schema.fmdRegisters)
        .where(and(...conditions))

      return { registers, total: totalResult?.count || 0 }
    }),

  get: orgAuthed
    .route({
      method: 'GET',
      path: '/registers/fmd/:id',
      summary: 'Get FMD register by ID',
      tags: ['Registers'],
    })
    .input(z.object({ id: z.string().uuid() }))
    .output(z.any())
    .handler(async ({ context, input }) => {
      const db = getDb(context)
      const [register] = await db
        .select()
        .from(schema.fmdRegisters)
        .where(
          and(
            eq(schema.fmdRegisters.id, input.id),
            eq(schema.fmdRegisters.organizationId, context.organization.id),
          ),
        )
        .limit(1)

      if (!register) {
        throw new ORPCError('NOT_FOUND', { message: 'FMD register not found' })
      }
      return register
    }),

  create: orgAuthed
    .route({
      method: 'POST',
      path: '/registers/fmd',
      summary: 'Create FMD register',
      tags: ['Registers'],
    })
    .input(createFmdRegisterSchema)
    .output(z.any())
    .handler(async ({ context, input }) => {
      const db = getDb(context)
      const [register] = await db
        .insert(schema.fmdRegisters)
        .values({
          organizationId: context.organization.id,
          createdBy: context.user.id,
          ...input,
          dateOfSampling: input.dateOfSampling ?? new Date().toISOString().slice(0, 10),
        })
        .returning()
      return register
    }),

  update: orgAuthed
    .route({
      method: 'PATCH',
      path: '/registers/fmd/:id',
      summary: 'Update FMD register',
      tags: ['Registers'],
    })
    .input(z.object({ id: z.string().uuid(), data: updateFmdRegisterSchema }))
    .output(z.any())
    .handler(async ({ context, input }) => {
      const db = getDb(context)
      const [existing] = await db
        .select()
        .from(schema.fmdRegisters)
        .where(
          and(
            eq(schema.fmdRegisters.id, input.id),
            eq(schema.fmdRegisters.organizationId, context.organization.id),
          ),
        )
        .limit(1)

      if (!existing) {
        throw new ORPCError('NOT_FOUND', { message: 'FMD register not found' })
      }

      const [register] = await db
        .update(schema.fmdRegisters)
        .set({
          ...input.data,
          updatedBy: context.user.id,
          updatedAt: new Date(),
        })
        .where(eq(schema.fmdRegisters.id, input.id))
        .returning()

      return register
    }),

  delete: orgAuthed
    .route({
      method: 'DELETE',
      path: '/registers/fmd/:id',
      summary: 'Delete FMD register',
      tags: ['Registers'],
    })
    .input(z.object({ id: z.string().uuid() }))
    .output(z.object({ success: z.boolean() }))
    .handler(async ({ context, input }) => {
      const db = getDb(context)
      const [existing] = await db
        .select()
        .from(schema.fmdRegisters)
        .where(
          and(
            eq(schema.fmdRegisters.id, input.id),
            eq(schema.fmdRegisters.organizationId, context.organization.id),
          ),
        )
        .limit(1)

      if (!existing) {
        throw new ORPCError('NOT_FOUND', { message: 'FMD register not found' })
      }

      await db.delete(schema.fmdRegisters).where(eq(schema.fmdRegisters.id, input.id))

      return { success: true }
    }),
}
