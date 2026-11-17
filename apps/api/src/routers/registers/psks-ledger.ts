/**
 * PSKS Ledger Register Router
 */

import { z } from 'zod'
import { eq, and, ilike, desc, count, gte, lte } from 'drizzle-orm'
import { orgAuthed, getDb, schema } from '../../procedures'
import { ORPCError } from '@orpc/server'
import {
  createPsksLedgerRegisterSchema,
  updatePsksLedgerRegisterSchema,
  psksLedgerRegisterFilterSchema,
} from '../../../../../packages/core/src/validators/registers/psks-ledger'

export const psksLedgerRegisterRouter = {
  list: orgAuthed
    .route({
      method: 'GET',
      path: '/registers/psks-ledger',
      summary: 'List PSKS ledger registers',
      tags: ['Registers'],
    })
    .input(psksLedgerRegisterFilterSchema.default({}))
    .output(z.object({ registers: z.array(z.any()), total: z.number() }))
    .handler(async ({ context, input }) => {
      const db = getDb(context)
      const conditions = [
        eq(schema.psksLedgerRegisters.organizationId, context.organization.id),
      ]

      if (input.srNo) {
        conditions.push(eq(schema.psksLedgerRegisters.srNo, input.srNo))
      }
      if (input.nameOfArticle) {
        conditions.push(
          ilike(
            schema.psksLedgerRegisters.nameOfArticle,
            `%${input.nameOfArticle}%`,
          ),
        )
      }
      if (input.dateOfSupplyFrom) {
        conditions.push(
          gte(
            schema.psksLedgerRegisters.dateOfSupply,
            input.dateOfSupplyFrom,
          ),
        )
      }
      if (input.dateOfSupplyTo) {
        conditions.push(
          lte(schema.psksLedgerRegisters.dateOfSupply, input.dateOfSupplyTo),
        )
      }
      if (input.receivedSource) {
        conditions.push(
          ilike(
            schema.psksLedgerRegisters.receivedSource,
            `%${input.receivedSource}%`,
          ),
        )
      }

      const registers = await db
        .select()
        .from(schema.psksLedgerRegisters)
        .where(and(...conditions))
        .orderBy(desc(schema.psksLedgerRegisters.createdAt))
        .limit(input.limit)
        .offset(input.offset)

      const [totalResult] = await db
        .select({ count: count() })
        .from(schema.psksLedgerRegisters)
        .where(and(...conditions))

      return { registers, total: totalResult?.count || 0 }
    }),

  get: orgAuthed
    .route({
      method: 'GET',
      path: '/registers/psks-ledger/:id',
      summary: 'Get PSKS ledger register by ID',
      tags: ['Registers'],
    })
    .input(z.object({ id: z.string().uuid() }))
    .output(z.any())
    .handler(async ({ context, input }) => {
      const db = getDb(context)
      const [register] = await db
        .select()
        .from(schema.psksLedgerRegisters)
        .where(
          and(
            eq(schema.psksLedgerRegisters.id, input.id),
            eq(
              schema.psksLedgerRegisters.organizationId,
              context.organization.id,
            ),
          ),
        )
        .limit(1)

      if (!register) {
        throw new ORPCError('NOT_FOUND', { message: 'PSKS ledger register not found' })
      }
      return register
    }),

  create: orgAuthed
    .route({
      method: 'POST',
      path: '/registers/psks-ledger',
      summary: 'Create PSKS ledger register',
      tags: ['Registers'],
    })
    .input(createPsksLedgerRegisterSchema)
    .output(z.any())
    .handler(async ({ context, input }) => {
      const db = getDb(context)
      const [register] = await db
        .insert(schema.psksLedgerRegisters)
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
      path: '/registers/psks-ledger/:id',
      summary: 'Update PSKS ledger register',
      tags: ['Registers'],
    })
    .input(
      z.object({
        id: z.string().uuid(),
        data: updatePsksLedgerRegisterSchema,
      }),
    )
    .output(z.any())
    .handler(async ({ context, input }) => {
      const db = getDb(context)
      const [existing] = await db
        .select()
        .from(schema.psksLedgerRegisters)
        .where(
          and(
            eq(schema.psksLedgerRegisters.id, input.id),
            eq(
              schema.psksLedgerRegisters.organizationId,
              context.organization.id,
            ),
          ),
        )
        .limit(1)

      if (!existing) {
        throw new ORPCError('NOT_FOUND', { message: 'PSKS ledger register not found' })
      }

      const [register] = await db
        .update(schema.psksLedgerRegisters)
        .set({
          ...input.data,
          updatedBy: context.user.id,
          updatedAt: new Date(),
        })
        .where(eq(schema.psksLedgerRegisters.id, input.id))
        .returning()

      return register
    }),

  delete: orgAuthed
    .route({
      method: 'DELETE',
      path: '/registers/psks-ledger/:id',
      summary: 'Delete PSKS ledger register',
      tags: ['Registers'],
    })
    .input(z.object({ id: z.string().uuid() }))
    .output(z.object({ success: z.boolean() }))
    .handler(async ({ context, input }) => {
      const db = getDb(context)
      const [existing] = await db
        .select()
        .from(schema.psksLedgerRegisters)
        .where(
          and(
            eq(schema.psksLedgerRegisters.id, input.id),
            eq(
              schema.psksLedgerRegisters.organizationId,
              context.organization.id,
            ),
          ),
        )
        .limit(1)

      if (!existing) {
        throw new ORPCError('NOT_FOUND', { message: 'PSKS ledger register not found' })
      }

      await db
        .delete(schema.psksLedgerRegisters)
        .where(eq(schema.psksLedgerRegisters.id, input.id))

      return { success: true }
    }),
}
