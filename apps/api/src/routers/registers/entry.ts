/**
 * Entry Register Router
 * 
 * Manages entry register (goods received) operations
 */

import { z } from 'zod'
import { eq, and, ilike, desc, count, gte, lte } from 'drizzle-orm'
import { orgAuthed, getDb, schema } from '../../procedures'
import { ORPCError } from '@orpc/server'
// TODO: Replace @{{PROJECT_SLUG}} with actual package name
import {
  createEntryRegisterSchema,
  updateEntryRegisterSchema,
  entryRegisterFilterSchema,
} from '../../../../../packages/core/src/validators/registers/entry'

export const entryRegisterRouter = {
  /**
   * List entry registers
   */
  list: orgAuthed
    .route({
      method: 'GET',
      path: '/registers/entry',
      summary: 'List entry registers',
      tags: ['Registers'],
    })
    .input(entryRegisterFilterSchema.optional())
    .output(
      z.object({
        registers: z.array(z.any()),
        total: z.number(),
      }),
    )
    .handler(async ({ context, input }) => {
      const db = getDb(context)
      const {
        invoice,
        receivingDateFrom,
        receivingDateTo,
        nameOfArticle,
        source,
        limit,
        offset,
      } = input

      const conditions = [
        eq(schema.entryRegisters.organizationId, context.organization.id),
      ]

      if (invoice) {
        conditions.push(
          ilike(schema.entryRegisters.invoice, `%${invoice}%`),
        )
      }

      if (receivingDateFrom) {
        conditions.push(
          gte(schema.entryRegisters.receivingDate, receivingDateFrom),
        )
      }

      if (receivingDateTo) {
        conditions.push(
          lte(schema.entryRegisters.receivingDate, receivingDateTo),
        )
      }

      if (nameOfArticle) {
        conditions.push(
          ilike(schema.entryRegisters.nameOfArticle, `%${nameOfArticle}%`),
        )
      }

      if (source) {
        conditions.push(ilike(schema.entryRegisters.source, `%${source}%`))
      }

      const registers = await db
        .select()
        .from(schema.entryRegisters)
        .where(and(...conditions))
        .orderBy(desc(schema.entryRegisters.createdAt))
        .limit(limit)
        .offset(offset)

      const [totalResult] = await db
        .select({ count: count() })
        .from(schema.entryRegisters)
        .where(and(...conditions))

      return {
        registers,
        total: totalResult?.count || 0,
      }
    }),

  /**
   * Get single entry register
   */
  get: orgAuthed
    .route({
      method: 'GET',
      path: '/registers/entry/:id',
      summary: 'Get entry register by ID',
      tags: ['Registers'],
    })
    .input(
      z.object({
        id: z.string().uuid(),
      }),
    )
    .output(z.any())
    .handler(async ({ context, input }) => {
      const db = getDb(context)

      const [register] = await db
        .select()
        .from(schema.entryRegisters)
        .where(
          and(
            eq(schema.entryRegisters.id, input.id),
            eq(schema.entryRegisters.organizationId, context.organization.id),
          ),
        )
        .limit(1)

      if (!register) {
        throw new ORPCError('NOT_FOUND', { message: 'Entry register not found' })
      }

      return register
    }),

  /**
   * Create entry register
   */
  create: orgAuthed
    .route({
      method: 'POST',
      path: '/registers/entry',
      summary: 'Create entry register',
      tags: ['Registers'],
    })
    .input(createEntryRegisterSchema)
    .output(z.any())
    .handler(async ({ context, input }) => {
      const db = getDb(context)

      const [register] = await db
        .insert(schema.entryRegisters)
        .values({
          organizationId: context.organization.id,
          createdBy: context.user.id,
          ...input,
          receivingDate: input.receivingDate ?? new Date().toISOString().slice(0, 10),
          nameOfArticle: input.nameOfArticle ?? 'Unknown',
          quantity: input.quantity ?? 0,
        })
        .returning()

      return register
    }),

  /**
   * Update entry register
   */
  update: orgAuthed
    .route({
      method: 'PATCH',
      path: '/registers/entry/:id',
      summary: 'Update entry register',
      tags: ['Registers'],
    })
    .input(
      z.object({
        id: z.string().uuid(),
        data: updateEntryRegisterSchema,
      }),
    )
    .output(z.any())
    .handler(async ({ context, input }) => {
      const db = getDb(context)

      // Verify ownership
      const [existing] = await db
        .select()
        .from(schema.entryRegisters)
        .where(
          and(
            eq(schema.entryRegisters.id, input.id),
            eq(schema.entryRegisters.organizationId, context.organization.id),
          ),
        )
        .limit(1)

      if (!existing) {
        throw new ORPCError('NOT_FOUND', { message: 'Entry register not found' })
      }

      const [register] = await db
        .update(schema.entryRegisters)
        .set({
          ...input.data,
          updatedBy: context.user.id,
          updatedAt: new Date(),
        })
        .where(eq(schema.entryRegisters.id, input.id))
        .returning()

      return register
    }),

  /**
   * Delete entry register
   */
  delete: orgAuthed
    .route({
      method: 'DELETE',
      path: '/registers/entry/:id',
      summary: 'Delete entry register',
      tags: ['Registers'],
    })
    .input(
      z.object({
        id: z.string().uuid(),
      }),
    )
    .output(z.object({ success: z.boolean() }))
    .handler(async ({ context, input }) => {
      const db = getDb(context)

      // Verify ownership
      const [existing] = await db
        .select()
        .from(schema.entryRegisters)
        .where(
          and(
            eq(schema.entryRegisters.id, input.id),
            eq(schema.entryRegisters.organizationId, context.organization.id),
          ),
        )
        .limit(1)

      if (!existing) {
        throw new ORPCError('NOT_FOUND', { message: 'Entry register not found' })
      }

      await db
        .delete(schema.entryRegisters)
        .where(eq(schema.entryRegisters.id, input.id))

      return { success: true }
    }),
}
