/**
 * Cross Register Search Router
 * 
 * Allows searching and linking data across all registers
 */

import { z } from 'zod'
import { eq, or, ilike, and } from 'drizzle-orm'
import { orgAuthed, getDb, schema } from '../procedures'
import { ORPCError } from '@orpc/server'

const searchSchema = z.object({
  query: z.string().min(1),
  registerTypes: z.array(z.string()).optional(),
})

export const crossRegisterRouter = {
  /**
   * Search across all registers
   */
  search: orgAuthed
    .route({
      method: 'POST',
      path: '/registers/search',
      summary: 'Search across all registers',
      tags: ['Registers'],
    })
    .input(searchSchema)
    .output(z.any())
    .handler(async ({ context, input }) => {
      const db = getDb(context)
      const { query, registerTypes } = input

      const results = {
        opd: [] as any[],
        biochemistry: [] as any[],
        stock: [] as any[],
        entry: [] as any[],
        brucellaRbpt: [] as any[],
        brucellaSero: [] as any[],
        fmd: [] as any[],
        birdFlu: [] as any[],
        abst: [] as any[],
        dailyExpenditure: [] as any[],
        psksCashbook: [] as any[],
        psksEntry: [] as any[],
        ledger: [] as any[],
        dispatch: [] as any[],
        psksLedger: [] as any[],
        psksStock: [] as any[],
      }

      const searchCondition = or(
        ilike(schema.opdRegisters.ownerName, `%${query}%`),
        ilike(schema.opdRegisters.sampleCode, `%${query}%`),
      )

      const shouldSearchOPD = !registerTypes || registerTypes.includes('opd')
      if (shouldSearchOPD) {
        results.opd = await db
          .select({
            id: schema.opdRegisters.id,
            date: schema.opdRegisters.date,
            ownerName: schema.opdRegisters.ownerName,
            sampleCode: schema.opdRegisters.sampleCode,
            testPerformed: schema.opdRegisters.testPerformed,
            result: schema.opdRegisters.result,
          })
          .from(schema.opdRegisters)
          .where(and(
            eq(schema.opdRegisters.organizationId, context.organization.id),
            searchCondition
          ))
          .limit(10)
      }

      const shouldSearchBiochemistry = !registerTypes || registerTypes.includes('biochemistry')
      if (shouldSearchBiochemistry) {
        results.biochemistry = await db
          .select({
            id: schema.biochemistryRegisters.id,
            date: schema.biochemistryRegisters.date,
            ownerName: schema.biochemistryRegisters.ownerName,
            species: schema.biochemistryRegisters.species,
            altUL: schema.biochemistryRegisters.altUL,
            ureaMgDl: schema.biochemistryRegisters.ureaMgDl,
          })
          .from(schema.biochemistryRegisters)
          .where(and(
            eq(schema.biochemistryRegisters.organizationId, context.organization.id),
            ilike(schema.biochemistryRegisters.ownerName, `%${query}%`)
          ))
          .limit(10)
      }

      return results
    }),

  /**
   * Link a record to another register
   */
  linkRecord: orgAuthed
    .route({
      method: 'POST',
      path: '/registers/link',
      summary: 'Link a record to another register',
      tags: ['Registers'],
    })
    .input(z.object({
      sourceRegister: z.enum(['opd', 'biochemistry', 'stock', 'entry', 'brucellaRbpt', 'brucellaSero', 'fmd', 'birdFlu', 'abst', 'dailyExpenditure', 'psksCashbook', 'psksEntry', 'ledger', 'dispatch', 'psksLedger', 'psksStock']),
      sourceId: z.string().uuid(),
      targetRegister: z.enum(['biochemistry', 'stock']),
      targetId: z.string().uuid(),
    }))
    .output(z.object({ success: z.boolean() }))
    .handler(async ({ context, input }) => {
      const db = getDb(context)
      const { sourceRegister, sourceId, targetRegister, targetId } = input

      if (targetRegister === 'biochemistry' && sourceRegister === 'opd') {
        await db
          .update(schema.biochemistryRegisters)
          .set({ opdRegisterId: sourceId })
          .where(eq(schema.biochemistryRegisters.id, targetId))
      }

      return { success: true }
    }),
}
