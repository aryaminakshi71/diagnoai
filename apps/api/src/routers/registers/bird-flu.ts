/**
 * Bird Flu Register Router
 */

import { z } from 'zod'
import { eq, and, ilike, desc, count } from 'drizzle-orm'
import { orgAuthed, getDb, schema } from '../../procedures'
import { ORPCError } from '@orpc/server'
import {
  createBirdFluRegisterSchema,
  updateBirdFluRegisterSchema,
  birdFluRegisterFilterSchema,
} from '../../../../../packages/core/src/validators/registers/bird-flu'

export const birdFluRegisterRouter = {
  list: orgAuthed
    .route({
      method: 'GET',
      path: '/registers/bird-flu',
      summary: 'List bird flu registers',
      tags: ['Registers'],
    })
    .input(birdFluRegisterFilterSchema.default({}))
    .output(z.object({ registers: z.array(z.any()), total: z.number() }))
    .handler(async ({ context, input }) => {
      const db = getDb(context)
      const conditions = [
        eq(schema.birdFluRegisters.organizationId, context.organization.id),
      ]

      if (input.srNo) {
        conditions.push(eq(schema.birdFluRegisters.srNo, input.srNo))
      }
      if (input.location) {
        conditions.push(eq(schema.birdFluRegisters.location, input.location))
      }
      if (input.villageWardArea) {
        conditions.push(
          ilike(
            schema.birdFluRegisters.villageWardArea,
            `%${input.villageWardArea}%`,
          ),
        )
      }

      const registers = await db
        .select()
        .from(schema.birdFluRegisters)
        .where(and(...conditions))
        .orderBy(desc(schema.birdFluRegisters.createdAt))
        .limit(input.limit)
        .offset(input.offset)

      const [totalResult] = await db
        .select({ count: count() })
        .from(schema.birdFluRegisters)
        .where(and(...conditions))

      return { registers, total: totalResult?.count || 0 }
    }),

  get: orgAuthed
    .route({
      method: 'GET',
      path: '/registers/bird-flu/:id',
      summary: 'Get bird flu register by ID',
      tags: ['Registers'],
    })
    .input(z.object({ id: z.string().uuid() }))
    .output(z.any())
    .handler(async ({ context, input }) => {
      const db = getDb(context)
      const [register] = await db
        .select()
        .from(schema.birdFluRegisters)
        .where(
          and(
            eq(schema.birdFluRegisters.id, input.id),
            eq(schema.birdFluRegisters.organizationId, context.organization.id),
          ),
        )
        .limit(1)

      if (!register) {
        throw new ORPCError('NOT_FOUND', { message: 'Bird flu register not found' })
      }
      return register
    }),

  create: orgAuthed
    .route({
      method: 'POST',
      path: '/registers/bird-flu',
      summary: 'Create bird flu register',
      tags: ['Registers'],
    })
    .input(createBirdFluRegisterSchema)
    .output(z.any())
    .handler(async ({ context, input }) => {
      const db = getDb(context)
      const [register] = await db
        .insert(schema.birdFluRegisters)
        .values({
          organizationId: context.organization.id,
          createdBy: context.user.id,
          ...input,
        })
        .returning()
      return register
    }),

  update: orgAuthed
    .route({
      method: 'PATCH',
      path: '/registers/bird-flu/:id',
      summary: 'Update bird flu register',
      tags: ['Registers'],
    })
    .input(
      z.object({
        id: z.string().uuid(),
        data: updateBirdFluRegisterSchema,
      }),
    )
    .output(z.any())
    .handler(async ({ context, input }) => {
      const db = getDb(context)
      const [existing] = await db
        .select()
        .from(schema.birdFluRegisters)
        .where(
          and(
            eq(schema.birdFluRegisters.id, input.id),
            eq(schema.birdFluRegisters.organizationId, context.organization.id),
          ),
        )
        .limit(1)

      if (!existing) {
        throw new ORPCError('NOT_FOUND', { message: 'Bird flu register not found' })
      }

      const [register] = await db
        .update(schema.birdFluRegisters)
        .set({
          ...input.data,
          updatedBy: context.user.id,
          updatedAt: new Date(),
        })
        .where(eq(schema.birdFluRegisters.id, input.id))
        .returning()

      return register
    }),

  delete: orgAuthed
    .route({
      method: 'DELETE',
      path: '/registers/bird-flu/:id',
      summary: 'Delete bird flu register',
      tags: ['Registers'],
    })
    .input(z.object({ id: z.string().uuid() }))
    .output(z.object({ success: z.boolean() }))
    .handler(async ({ context, input }) => {
      const db = getDb(context)
      const [existing] = await db
        .select()
        .from(schema.birdFluRegisters)
        .where(
          and(
            eq(schema.birdFluRegisters.id, input.id),
            eq(schema.birdFluRegisters.organizationId, context.organization.id),
          ),
        )
        .limit(1)

      if (!existing) {
        throw new ORPCError('NOT_FOUND', { message: 'Bird flu register not found' })
      }

      await db
        .delete(schema.birdFluRegisters)
        .where(eq(schema.birdFluRegisters.id, input.id))

      return { success: true }
    }),
}
