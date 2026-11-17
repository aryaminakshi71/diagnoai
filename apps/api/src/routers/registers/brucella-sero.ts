/**
 * Brucella Sero Surveillance Register Router
 */

import { z } from 'zod'
import { eq, and, ilike, desc, count, gte, lte } from 'drizzle-orm'
import { orgAuthed, getDb, schema } from '../../procedures'
import { ORPCError } from '@orpc/server'
import {
  createBrucellaSeroRegisterSchema,
  updateBrucellaSeroRegisterSchema,
  brucellaSeroRegisterFilterSchema,
} from '../../../../../packages/core/src/validators/registers/brucella-sero'

export const brucellaSeroRegisterRouter = {
  list: orgAuthed
    .route({
      method: 'GET',
      path: '/registers/brucella-sero',
      summary: 'List Brucella sero surveillance registers',
      tags: ['Registers'],
    })
    .input(brucellaSeroRegisterFilterSchema.optional())
    .output(z.object({ registers: z.array(z.any()), total: z.number() }))
    .handler(async ({ context, input }) => {
      const db = getDb(context)
      const conditions = [
        eq(
          schema.brucellaSeroRegisters.organizationId,
          context.organization.id,
        ),
      ]

      if (input.srNo) {
        conditions.push(eq(schema.brucellaSeroRegisters.srNo, input.srNo))
      }
      if (input.ownerName) {
        conditions.push(
          ilike(
            schema.brucellaSeroRegisters.ownerName,
            `%${input.ownerName}%`,
          ),
        )
      }
      if (input.dateOfSamplingFrom) {
        conditions.push(
          gte(
            schema.brucellaSeroRegisters.dateOfSampling,
            input.dateOfSamplingFrom,
          ),
        )
      }
      if (input.dateOfSamplingTo) {
        conditions.push(
          lte(
            schema.brucellaSeroRegisters.dateOfSampling,
            input.dateOfSamplingTo,
          ),
        )
      }

      const registers = await db
        .select()
        .from(schema.brucellaSeroRegisters)
        .where(and(...conditions))
        .orderBy(desc(schema.brucellaSeroRegisters.createdAt))
        .limit(input.limit)
        .offset(input.offset)

      const [totalResult] = await db
        .select({ count: count() })
        .from(schema.brucellaSeroRegisters)
        .where(and(...conditions))

      return { registers, total: totalResult?.count || 0 }
    }),

  get: orgAuthed
    .route({
      method: 'GET',
      path: '/registers/brucella-sero/:id',
      summary: 'Get Brucella sero register by ID',
      tags: ['Registers'],
    })
    .input(z.object({ id: z.string().uuid() }))
    .output(z.any())
    .handler(async ({ context, input }) => {
      const db = getDb(context)
      const [register] = await db
        .select()
        .from(schema.brucellaSeroRegisters)
        .where(
          and(
            eq(schema.brucellaSeroRegisters.id, input.id),
            eq(
              schema.brucellaSeroRegisters.organizationId,
              context.organization.id,
            ),
          ),
        )
        .limit(1)

      if (!register) {
        throw new ORPCError('NOT_FOUND', { message: 'Brucella sero register not found' })
      }
      return register
    }),

  create: orgAuthed
    .route({
      method: 'POST',
      path: '/registers/brucella-sero',
      summary: 'Create Brucella sero register',
      tags: ['Registers'],
    })
    .input(createBrucellaSeroRegisterSchema)
    .output(z.any())
    .handler(async ({ context, input }) => {
      const db = getDb(context)
      const [register] = await db
        .insert(schema.brucellaSeroRegisters)
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
      path: '/registers/brucella-sero/:id',
      summary: 'Update Brucella sero register',
      tags: ['Registers'],
    })
    .input(
      z.object({
        id: z.string().uuid(),
        data: updateBrucellaSeroRegisterSchema,
      }),
    )
    .output(z.any())
    .handler(async ({ context, input }) => {
      const db = getDb(context)
      const [existing] = await db
        .select()
        .from(schema.brucellaSeroRegisters)
        .where(
          and(
            eq(schema.brucellaSeroRegisters.id, input.id),
            eq(
              schema.brucellaSeroRegisters.organizationId,
              context.organization.id,
            ),
          ),
        )
        .limit(1)

      if (!existing) {
        throw new ORPCError('NOT_FOUND', { message: 'Brucella sero register not found' })
      }

      const [register] = await db
        .update(schema.brucellaSeroRegisters)
        .set({
          ...input.data,
          updatedBy: context.user.id,
          updatedAt: new Date(),
        })
        .where(eq(schema.brucellaSeroRegisters.id, input.id))
        .returning()

      return register
    }),

  delete: orgAuthed
    .route({
      method: 'DELETE',
      path: '/registers/brucella-sero/:id',
      summary: 'Delete Brucella sero register',
      tags: ['Registers'],
    })
    .input(z.object({ id: z.string().uuid() }))
    .output(z.object({ success: z.boolean() }))
    .handler(async ({ context, input }) => {
      const db = getDb(context)
      const [existing] = await db
        .select()
        .from(schema.brucellaSeroRegisters)
        .where(
          and(
            eq(schema.brucellaSeroRegisters.id, input.id),
            eq(
              schema.brucellaSeroRegisters.organizationId,
              context.organization.id,
            ),
          ),
        )
        .limit(1)

      if (!existing) {
        throw new ORPCError('NOT_FOUND', { message: 'Brucella sero register not found' })
      }

      await db
        .delete(schema.brucellaSeroRegisters)
        .where(eq(schema.brucellaSeroRegisters.id, input.id))

      return { success: true }
    }),
}
