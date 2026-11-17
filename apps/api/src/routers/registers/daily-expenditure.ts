/**
 * Daily Expenditure Register Router
 * 
 * Handles daily expenditure registers with daily entries (1-31 days)
 */

import { z } from 'zod'
import { eq, and, desc, count, ilike } from 'drizzle-orm'
import { orgAuthed, getDb, schema } from '../../procedures'
import { ORPCError } from '@orpc/server'
import {
  createDailyExpenditureRegisterSchema,
  updateDailyExpenditureRegisterSchema,
  dailyExpenditureRegisterFilterSchema,
} from '../../../../../packages/core/src/validators/registers/daily-expenditure'

export const dailyExpenditureRegisterRouter = {
  list: orgAuthed
    .route({
      method: 'GET',
      path: '/registers/daily-expenditure',
      summary: 'List daily expenditure registers',
      tags: ['Registers'],
    })
    .input(dailyExpenditureRegisterFilterSchema)
    .output(z.object({ registers: z.array(z.any()), total: z.number() }))
    .handler(async ({ context, input }) => {
      const db = getDb(context)
      const conditions = [
        eq(
          schema.dailyExpenditureRegisters.organizationId,
          context.organization.id,
        ),
      ]

      if (input.month) {
        conditions.push(eq(schema.dailyExpenditureRegisters.month, input.month))
      }
      if (input.year) {
        conditions.push(eq(schema.dailyExpenditureRegisters.year, input.year))
      }
      if (input.particulars) {
        conditions.push(
          ilike(
            schema.dailyExpenditureRegisters.particulars,
            `%${input.particulars}%`,
          ),
        )
      }

      const registers = await db
        .select()
        .from(schema.dailyExpenditureRegisters)
        .where(and(...conditions))
        .orderBy(desc(schema.dailyExpenditureRegisters.createdAt))
        .limit(input.limit)
        .offset(input.offset)

      const [totalResult] = await db
        .select({ count: count() })
        .from(schema.dailyExpenditureRegisters)
        .where(and(...conditions))

      return { registers, total: totalResult?.count || 0 }
    }),

  get: orgAuthed
    .route({
      method: 'GET',
      path: '/registers/daily-expenditure/:id',
      summary: 'Get daily expenditure register by ID with entries',
      tags: ['Registers'],
    })
    .input(z.object({ id: z.string().uuid() }))
    .output(z.any())
    .handler(async ({ context, input }) => {
      const db = getDb(context)
      const [register] = await db
        .select()
        .from(schema.dailyExpenditureRegisters)
        .where(
          and(
            eq(schema.dailyExpenditureRegisters.id, input.id),
            eq(
              schema.dailyExpenditureRegisters.organizationId,
              context.organization.id,
            ),
          ),
        )
        .limit(1)

      if (!register) {
        throw new ORPCError('NOT_FOUND', { message: 'Daily expenditure register not found' })
      }

      // Get daily entries
      const entries = await db
        .select()
        .from(schema.dailyExpenditureEntries)
        .where(eq(schema.dailyExpenditureEntries.registerId, register.id))
        .orderBy(schema.dailyExpenditureEntries.dayNumber)

      return { ...register, entries }
    }),

  create: orgAuthed
    .route({
      method: 'POST',
      path: '/registers/daily-expenditure',
      summary: 'Create daily expenditure register with entries',
      tags: ['Registers'],
    })
    .input(createDailyExpenditureRegisterSchema)
    .output(z.any())
    .handler(async ({ context, input }) => {
      const db = getDb(context)
      const { entries, ...registerData } = input

      // Create register
      const [register] = await db
        .insert(schema.dailyExpenditureRegisters)
        .values({
          organizationId: context.organization.id,
          createdBy: context.user.id,
          ...registerData,
          particulars: registerData.particulars ?? 'Daily Expenditure',
        })
        .returning()

      // Create entries if provided
      if (entries && entries.length > 0) {
        await db.insert(schema.dailyExpenditureEntries).values(
          entries.map((entry) => ({
            registerId: register.id,
            ...entry,
            dayNumber: entry.dayNumber ?? 1,
          })),
        )
      }

      return register
    }),

  update: orgAuthed
    .route({
      method: 'PATCH',
      path: '/registers/daily-expenditure/:id',
      summary: 'Update daily expenditure register',
      tags: ['Registers'],
    })
    .input(
      z.object({
        id: z.string().uuid(),
        data: updateDailyExpenditureRegisterSchema,
      }),
    )
    .output(z.any())
    .handler(async ({ context, input }) => {
      const db = getDb(context)
      const [existing] = await db
        .select()
        .from(schema.dailyExpenditureRegisters)
        .where(
          and(
            eq(schema.dailyExpenditureRegisters.id, input.id),
            eq(
              schema.dailyExpenditureRegisters.organizationId,
              context.organization.id,
            ),
          ),
        )
        .limit(1)

      if (!existing) {
        throw new ORPCError('NOT_FOUND', { message: 'Daily expenditure register not found' })
      }

      const { entries, ...registerData } = input.data

      // Update register
      const [register] = await db
        .update(schema.dailyExpenditureRegisters)
        .set({
          ...registerData,
          updatedBy: context.user.id,
          updatedAt: new Date(),
        })
        .where(eq(schema.dailyExpenditureRegisters.id, input.id))
        .returning()

      // Update entries if provided
      if (entries) {
        // Delete existing entries
        await db
          .delete(schema.dailyExpenditureEntries)
          .where(eq(schema.dailyExpenditureEntries.registerId, input.id))

        // Insert new entries
        if (entries.length > 0) {
          await db.insert(schema.dailyExpenditureEntries).values(
            entries.map((entry) => ({
              registerId: input.id,
              ...entry,
              dayNumber: entry.dayNumber ?? 1,
            })),
          )
        }
      }

      return register
    }),

  delete: orgAuthed
    .route({
      method: 'DELETE',
      path: '/registers/daily-expenditure/:id',
      summary: 'Delete daily expenditure register',
      tags: ['Registers'],
    })
    .input(z.object({ id: z.string().uuid() }))
    .output(z.object({ success: z.boolean() }))
    .handler(async ({ context, input }) => {
      const db = getDb(context)
      const [existing] = await db
        .select()
        .from(schema.dailyExpenditureRegisters)
        .where(
          and(
            eq(schema.dailyExpenditureRegisters.id, input.id),
            eq(
              schema.dailyExpenditureRegisters.organizationId,
              context.organization.id,
            ),
          ),
        )
        .limit(1)

      if (!existing) {
        throw new ORPCError('NOT_FOUND', { message: 'Daily expenditure register not found' })
      }

      // Delete entries first (cascade should handle this, but being explicit)
      await db
        .delete(schema.dailyExpenditureEntries)
        .where(eq(schema.dailyExpenditureEntries.registerId, input.id))

      // Delete register
      await db
        .delete(schema.dailyExpenditureRegisters)
        .where(eq(schema.dailyExpenditureRegisters.id, input.id))

      return { success: true }
    }),
}
