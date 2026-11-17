/**
 * PSKS Entry Register Router
 */

import { z } from 'zod'
import { eq, and, ilike, desc, count, gte, lte } from 'drizzle-orm'
import { orgAuthed, getDb, schema } from '../../procedures'
import { ORPCError } from '@orpc/server'
import {
  createPsksEntryRegisterSchema,
  updatePsksEntryRegisterSchema,
  psksEntryRegisterFilterSchema,
} from '../../../../../packages/core/src/validators/registers/psks-entry'

export const psksEntryRegisterRouter = {
  list: orgAuthed
    .route({
      method: 'GET',
      path: '/registers/psks-entry',
      summary: 'List PSKS entry registers',
      tags: ['Registers'],
    })
    .input(psksEntryRegisterFilterSchema.default({}))
    .output(z.object({ registers: z.array(z.any()), total: z.number() }))
    .handler(async ({ context, input }) => {
      const db = getDb(context)
      const conditions = [
        eq(schema.psksEntryRegisters.organizationId, context.organization.id),
      ]

      if (input.srNo) {
        conditions.push(eq(schema.psksEntryRegisters.srNo, input.srNo))
      }
      if (input.dateOfBillFrom) {
        conditions.push(
          gte(schema.psksEntryRegisters.dateOfBill, input.dateOfBillFrom),
        )
      }
      if (input.dateOfBillTo) {
        conditions.push(
          lte(schema.psksEntryRegisters.dateOfBill, input.dateOfBillTo),
        )
      }
      if (input.billInvoiceNo) {
        conditions.push(
          ilike(
            schema.psksEntryRegisters.billInvoiceNo,
            `%${input.billInvoiceNo}%`,
          ),
        )
      }
      if (input.source) {
        conditions.push(
          ilike(schema.psksEntryRegisters.source, `%${input.source}%`),
        )
      }

      const registers = await db
        .select()
        .from(schema.psksEntryRegisters)
        .where(and(...conditions))
        .orderBy(desc(schema.psksEntryRegisters.createdAt))
        .limit(input.limit)
        .offset(input.offset)

      const [totalResult] = await db
        .select({ count: count() })
        .from(schema.psksEntryRegisters)
        .where(and(...conditions))

      return { registers, total: totalResult?.count || 0 }
    }),

  get: orgAuthed
    .route({
      method: 'GET',
      path: '/registers/psks-entry/:id',
      summary: 'Get PSKS entry register by ID',
      tags: ['Registers'],
    })
    .input(z.object({ id: z.string().uuid() }))
    .output(z.any())
    .handler(async ({ context, input }) => {
      const db = getDb(context)
      const [register] = await db
        .select()
        .from(schema.psksEntryRegisters)
        .where(
          and(
            eq(schema.psksEntryRegisters.id, input.id),
            eq(schema.psksEntryRegisters.organizationId, context.organization.id),
          ),
        )
        .limit(1)

      if (!register) {
        throw new ORPCError('NOT_FOUND', { message: 'PSKS entry register not found' })
      }
      return register
    }),

  create: orgAuthed
    .route({
      method: 'POST',
      path: '/registers/psks-entry',
      summary: 'Create PSKS entry register',
      tags: ['Registers'],
    })
    .input(createPsksEntryRegisterSchema)
    .output(z.any())
    .handler(async ({ context, input }) => {
      const db = getDb(context)
      const [register] = await db
        .insert(schema.psksEntryRegisters)
        .values({
          organizationId: context.organization.id,
          createdBy: context.user.id,
          ...input,
          dateOfBill: input.dateOfBill ?? new Date().toISOString().slice(0, 10),
        })
        .returning()
      return register
    }),

  update: orgAuthed
    .route({
      method: 'PATCH',
      path: '/registers/psks-entry/:id',
      summary: 'Update PSKS entry register',
      tags: ['Registers'],
    })
    .input(
      z.object({
        id: z.string().uuid(),
        data: updatePsksEntryRegisterSchema,
      }),
    )
    .output(z.any())
    .handler(async ({ context, input }) => {
      const db = getDb(context)
      const [existing] = await db
        .select()
        .from(schema.psksEntryRegisters)
        .where(
          and(
            eq(schema.psksEntryRegisters.id, input.id),
            eq(schema.psksEntryRegisters.organizationId, context.organization.id),
          ),
        )
        .limit(1)

      if (!existing) {
        throw new ORPCError('NOT_FOUND', { message: 'PSKS entry register not found' })
      }

      const [register] = await db
        .update(schema.psksEntryRegisters)
        .set({
          ...input.data,
          updatedBy: context.user.id,
          updatedAt: new Date(),
        })
        .where(eq(schema.psksEntryRegisters.id, input.id))
        .returning()

      return register
    }),

  delete: orgAuthed
    .route({
      method: 'DELETE',
      path: '/registers/psks-entry/:id',
      summary: 'Delete PSKS entry register',
      tags: ['Registers'],
    })
    .input(z.object({ id: z.string().uuid() }))
    .output(z.object({ success: z.boolean() }))
    .handler(async ({ context, input }) => {
      const db = getDb(context)
      const [existing] = await db
        .select()
        .from(schema.psksEntryRegisters)
        .where(
          and(
            eq(schema.psksEntryRegisters.id, input.id),
            eq(schema.psksEntryRegisters.organizationId, context.organization.id),
          ),
        )
        .limit(1)

      if (!existing) {
        throw new ORPCError('NOT_FOUND', { message: 'PSKS entry register not found' })
      }

      await db
        .delete(schema.psksEntryRegisters)
        .where(eq(schema.psksEntryRegisters.id, input.id))

      return { success: true }
    }),
}
