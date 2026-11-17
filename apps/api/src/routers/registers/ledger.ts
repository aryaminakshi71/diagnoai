/**
 * Ledger Register Router
 */

import { z } from 'zod'
import { eq, and, ilike, desc, count, gte, lte } from 'drizzle-orm'
import { orgAuthed, getDb, schema } from '../../procedures'
import { ORPCError } from '@orpc/server'
import {
  createLedgerRegisterSchema,
  updateLedgerRegisterSchema,
  ledgerRegisterFilterSchema,
} from '../../../../../packages/core/src/validators/registers/ledger'

export const ledgerRegisterRouter = {
  list: orgAuthed
    .route({
      method: 'GET',
      path: '/registers/ledger',
      summary: 'List ledger registers',
      tags: ['Registers'],
    })
    .input(ledgerRegisterFilterSchema.default({}))
    .output(z.object({ registers: z.array(z.any()), total: z.number() }))
    .handler(async ({ context, input }) => {
      const db = getDb(context)
      const conditions = [
        eq(schema.ledgerRegisters.organizationId, context.organization.id),
      ]

      if (input.srNo) {
        conditions.push(eq(schema.ledgerRegisters.srNo, input.srNo))
      }
      if (input.nameOfArticle) {
        conditions.push(
          ilike(
            schema.ledgerRegisters.nameOfArticle,
            `%${input.nameOfArticle}%`,
          ),
        )
      }
      if (input.dateOfSupplyFrom) {
        conditions.push(
          gte(schema.ledgerRegisters.dateOfSupply, input.dateOfSupplyFrom),
        )
      }
      if (input.dateOfSupplyTo) {
        conditions.push(
          lte(schema.ledgerRegisters.dateOfSupply, input.dateOfSupplyTo),
        )
      }
      if (input.receivedSource) {
        conditions.push(
          ilike(
            schema.ledgerRegisters.receivedSource,
            `%${input.receivedSource}%`,
          ),
        )
      }

      const registers = await db
        .select()
        .from(schema.ledgerRegisters)
        .where(and(...conditions))
        .orderBy(desc(schema.ledgerRegisters.createdAt))
        .limit(input.limit)
        .offset(input.offset)

      const [totalResult] = await db
        .select({ count: count() })
        .from(schema.ledgerRegisters)
        .where(and(...conditions))

      return { registers, total: totalResult?.count || 0 }
    }),

  get: orgAuthed
    .route({
      method: 'GET',
      path: '/registers/ledger/:id',
      summary: 'Get ledger register by ID',
      tags: ['Registers'],
    })
    .input(z.object({ id: z.string().uuid() }))
    .output(z.any())
    .handler(async ({ context, input }) => {
      const db = getDb(context)
      const [register] = await db
        .select()
        .from(schema.ledgerRegisters)
        .where(
          and(
            eq(schema.ledgerRegisters.id, input.id),
            eq(schema.ledgerRegisters.organizationId, context.organization.id),
          ),
        )
        .limit(1)

      if (!register) {
        throw new ORPCError('NOT_FOUND', { message: 'Ledger register not found' })
      }
      return register
    }),

  create: orgAuthed
    .route({
      method: 'POST',
      path: '/registers/ledger',
      summary: 'Create ledger register',
      tags: ['Registers'],
    })
    .input(createLedgerRegisterSchema)
    .output(z.any())
    .handler(async ({ context, input }) => {
      const db = getDb(context)
      const [register] = await db
        .insert(schema.ledgerRegisters)
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
      path: '/registers/ledger/:id',
      summary: 'Update ledger register',
      tags: ['Registers'],
    })
    .input(
      z.object({
        id: z.string().uuid(),
        data: updateLedgerRegisterSchema,
      }),
    )
    .output(z.any())
    .handler(async ({ context, input }) => {
      const db = getDb(context)
      const [existing] = await db
        .select()
        .from(schema.ledgerRegisters)
        .where(
          and(
            eq(schema.ledgerRegisters.id, input.id),
            eq(schema.ledgerRegisters.organizationId, context.organization.id),
          ),
        )
        .limit(1)

      if (!existing) {
        throw new ORPCError('NOT_FOUND', { message: 'Ledger register not found' })
      }

      const [register] = await db
        .update(schema.ledgerRegisters)
        .set({
          ...input.data,
          updatedBy: context.user.id,
          updatedAt: new Date(),
        })
        .where(eq(schema.ledgerRegisters.id, input.id))
        .returning()

      return register
    }),

  delete: orgAuthed
    .route({
      method: 'DELETE',
      path: '/registers/ledger/:id',
      summary: 'Delete ledger register',
      tags: ['Registers'],
    })
    .input(z.object({ id: z.string().uuid() }))
    .output(z.object({ success: z.boolean() }))
    .handler(async ({ context, input }) => {
      const db = getDb(context)
      const [existing] = await db
        .select()
        .from(schema.ledgerRegisters)
        .where(
          and(
            eq(schema.ledgerRegisters.id, input.id),
            eq(schema.ledgerRegisters.organizationId, context.organization.id),
          ),
        )
        .limit(1)

      if (!existing) {
        throw new ORPCError('NOT_FOUND', { message: 'Ledger register not found' })
      }

      await db
        .delete(schema.ledgerRegisters)
        .where(eq(schema.ledgerRegisters.id, input.id))

      return { success: true }
    }),
}
