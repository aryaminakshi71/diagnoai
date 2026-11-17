/**
 * Brucella RBPT Register Router
 */

import { z } from 'zod'
import { eq, and, ilike, desc, count, gte, lte } from 'drizzle-orm'
import { orgAuthed, getDb, schema } from '../../procedures'
import { ORPCError } from '@orpc/server'
import {
  createBrucellaRbptRegisterSchema,
  updateBrucellaRbptRegisterSchema,
  brucellaRbptRegisterFilterSchema,
  batchCreateBrucellaRbptSchema,
} from '../../../../../packages/core/src/validators/registers/brucella-rbpt'

export const brucellaRbptRegisterRouter = {
  list: orgAuthed
    .route({
      method: 'GET',
      path: '/registers/brucella-rbpt',
      summary: 'List Brucella RBPT registers',
      tags: ['Registers'],
    })
    .input(brucellaRbptRegisterFilterSchema.default({}))
    .output(z.object({ registers: z.array(z.any()), total: z.number() }))
    .handler(async ({ context, input }) => {
      const db = getDb(context)
      const conditions = [
        eq(
          schema.brucellaRbptRegisters.organizationId,
          context.organization.id,
        ),
      ]

      if (input.dateFrom) {
        conditions.push(
          gte(schema.brucellaRbptRegisters.date, input.dateFrom),
        )
      }
      if (input.dateTo) {
        conditions.push(lte(schema.brucellaRbptRegisters.date, input.dateTo))
      }
      if (input.name) {
        conditions.push(
          ilike(schema.brucellaRbptRegisters.name, `%${input.name}%`),
        )
      }
      if (input.species) {
        conditions.push(eq(schema.brucellaRbptRegisters.species, input.species))
      }

      const registers = await db
        .select()
        .from(schema.brucellaRbptRegisters)
        .where(and(...conditions))
        .orderBy(desc(schema.brucellaRbptRegisters.createdAt))
        .limit(input.limit)
        .offset(input.offset)

      const [totalResult] = await db
        .select({ count: count() })
        .from(schema.brucellaRbptRegisters)
        .where(and(...conditions))

      return { registers, total: totalResult?.count || 0 }
    }),

  get: orgAuthed
    .route({
      method: 'GET',
      path: '/registers/brucella-rbpt/:id',
      summary: 'Get Brucella RBPT register by ID',
      tags: ['Registers'],
    })
    .input(z.object({ id: z.string().uuid() }))
    .output(z.any())
    .handler(async ({ context, input }) => {
      const db = getDb(context)
      const [register] = await db
        .select()
        .from(schema.brucellaRbptRegisters)
        .where(
          and(
            eq(schema.brucellaRbptRegisters.id, input.id),
            eq(
              schema.brucellaRbptRegisters.organizationId,
              context.organization.id,
            ),
          ),
        )
        .limit(1)

      if (!register) {
        throw new ORPCError('NOT_FOUND', { message: 'Brucella RBPT register not found' })
      }
      return register
    }),

  create: orgAuthed
    .route({
      method: 'POST',
      path: '/registers/brucella-rbpt',
      summary: 'Create Brucella RBPT register',
      tags: ['Registers'],
    })
    .input(createBrucellaRbptRegisterSchema)
    .output(z.any())
    .handler(async ({ context, input }) => {
      const db = getDb(context)
      const [register] = await db
        .insert(schema.brucellaRbptRegisters)
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
      path: '/registers/brucella-rbpt/:id',
      summary: 'Update Brucella RBPT register',
      tags: ['Registers'],
    })
    .input(
      z.object({
        id: z.string().uuid(),
        data: updateBrucellaRbptRegisterSchema,
      }),
    )
    .output(z.any())
    .handler(async ({ context, input }) => {
      const db = getDb(context)
      const [existing] = await db
        .select()
        .from(schema.brucellaRbptRegisters)
        .where(
          and(
            eq(schema.brucellaRbptRegisters.id, input.id),
            eq(
              schema.brucellaRbptRegisters.organizationId,
              context.organization.id,
            ),
          ),
        )
        .limit(1)

      if (!existing) {
        throw new ORPCError('NOT_FOUND', { message: 'Brucella RBPT register not found' })
      }

      const [register] = await db
        .update(schema.brucellaRbptRegisters)
        .set({
          ...input.data,
          updatedBy: context.user.id,
          updatedAt: new Date(),
        })
        .where(eq(schema.brucellaRbptRegisters.id, input.id))
        .returning()

      return register
    }),

  delete: orgAuthed
    .route({
      method: 'DELETE',
      path: '/registers/brucella-rbpt/:id',
      summary: 'Delete Brucella RBPT register',
      tags: ['Registers'],
    })
    .input(z.object({ id: z.string().uuid() }))
    .output(z.object({ success: z.boolean() }))
    .handler(async ({ context, input }) => {
      const db = getDb(context)
      const [existing] = await db
        .select()
        .from(schema.brucellaRbptRegisters)
        .where(
          and(
            eq(schema.brucellaRbptRegisters.id, input.id),
            eq(
              schema.brucellaRbptRegisters.organizationId,
              context.organization.id,
            ),
          ),
        )
        .limit(1)

      if (!existing) {
        throw new ORPCError('NOT_FOUND', { message: 'Brucella RBPT register not found' })
      }

      await db
        .delete(schema.brucellaRbptRegisters)
        .where(eq(schema.brucellaRbptRegisters.id, input.id))

      return { success: true }
    }),

  batchCreate: orgAuthed
    .route({
      method: 'POST',
      path: '/registers/brucella-rbpt/batch',
      summary: 'Batch create Brucella RBPT records',
      tags: ['Registers'],
    })
    .input(batchCreateBrucellaRbptSchema)
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
            .insert(schema.brucellaRbptRegisters)
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
