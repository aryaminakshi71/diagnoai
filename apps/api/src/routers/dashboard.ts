/**
 * Dashboard Router
 *
 * Dashboard metrics and analytics
 */

import { z } from 'zod'
import { eq, and, gte, sql, count, desc } from 'drizzle-orm'
import { orgAuthed, getDb, schema } from '../procedures'

export const dashboardRouter = {
  /**
   * Get dashboard metrics
   */
  metrics: orgAuthed
    .route({
      method: 'GET',
      path: '/dashboard/metrics',
      summary: 'Get dashboard metrics',
      tags: ['Dashboard'],
    })
    .input(z.object({}).optional())
    .output(
      z.object({
        openTickets: z.number(),
        resolvedToday: z.number(),
        avgResponseTime: z.number(),
        activeAgents: z.number(),
        satisfactionScore: z.number(),
        slaCompliance: z.number(),
        firstResponseTime: z.number(),
        resolutionRate: z.number(),
      }),
    )
    .handler(async ({ context }) => {
      const db = getDb(context)
      const orgId = context.organization.id

      // Open tickets count
      const [openTicketsResult] = await db
        .select({ count: count() })
        .from(schema.tickets)
        .where(
          and(
            eq(schema.tickets.organizationId, orgId),
            eq(schema.tickets.status, 'open'),
          ),
        )

      const openTickets = openTicketsResult?.count || 0

      // Resolved today
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const [resolvedTodayResult] = await db
        .select({ count: count() })
        .from(schema.tickets)
        .where(
          and(
            eq(schema.tickets.organizationId, orgId),
            eq(schema.tickets.status, 'resolved'),
            gte(schema.tickets.resolvedAt, today),
          ),
        )

      const resolvedToday = resolvedTodayResult?.count || 0

      // Total tickets for resolution rate
      const [totalTicketsResult] = await db
        .select({ count: count() })
        .from(schema.tickets)
        .where(eq(schema.tickets.organizationId, orgId))

      const totalTickets = totalTicketsResult?.count || 0
      const [resolvedTicketsResult] = await db
        .select({ count: count() })
        .from(schema.tickets)
        .where(
          and(
            eq(schema.tickets.organizationId, orgId),
            eq(schema.tickets.status, 'resolved'),
          ),
        )

      const resolvedTickets = resolvedTicketsResult?.count || 0
      const resolutionRate =
        totalTickets > 0 ? (resolvedTickets / totalTickets) * 100 : 0

      // Active agents (users with assigned tickets)
      const [activeAgentsResult] = await db
        .select({
          count: sql<number>`COUNT(DISTINCT ${schema.tickets.assignedTo})`,
        })
        .from(schema.tickets)
        .where(
          and(
            eq(schema.tickets.organizationId, orgId),
            sql`${schema.tickets.assignedTo} IS NOT NULL`,
            sql`${schema.tickets.status} IN ('open', 'in_progress')`,
          ),
        )

      const activeAgents = Number(activeAgentsResult?.count) || 0

      // Calculate average response time (simplified - time to first comment)
      // In a real implementation, you'd track first response time more accurately
      const avgResponseTime = 2.5 // Placeholder - would calculate from ticketComments

      // First response time (placeholder)
      const firstResponseTime = 1.2

      // Satisfaction score (placeholder - would come from CSAT data)
      const satisfactionScore = 4.7

      // SLA compliance (placeholder - would calculate from slaStatus table)
      const slaCompliance = 94.2

      return {
        openTickets,
        resolvedToday,
        avgResponseTime,
        activeAgents,
        satisfactionScore,
        slaCompliance,
        firstResponseTime,
        resolutionRate: Math.round(resolutionRate * 10) / 10,
      }
    }),

  /**
   * Get ticket trends
   */
  trends: orgAuthed
    .route({
      method: 'GET',
      path: '/dashboard/trends',
      summary: 'Get ticket trends',
      tags: ['Dashboard'],
    })
    .input(
      z
        .object({
          days: z.number().int().min(1).max(30).optional().default(7),
        })
        .optional(),
    )
    .output(
      z.object({
        trends: z.array(
          z.object({
            day: z.string(),
            value: z.number(),
          }),
        ),
      }),
    )
    .handler(async ({ context, input }) => {
      const db = getDb(context)
      const orgId = context.organization.id
      const days = input?.days || 7

      // Generate date range
      const trends: Array<{ day: string; value: number }> = []

      for (let i = days - 1; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        date.setHours(0, 0, 0, 0)

        const nextDate = new Date(date)
        nextDate.setDate(nextDate.getDate() + 1)

        const [result] = await db
          .select({ count: count() })
          .from(schema.tickets)
          .where(
            and(
              eq(schema.tickets.organizationId, orgId),
              gte(schema.tickets.createdAt, date),
              sql`${schema.tickets.createdAt} < ${nextDate}`,
            ),
          )

        trends.push({
          day: date.toISOString().split('T')[0],
          value: result?.count || 0,
        })
      }

      return { trends }
    }),

  /**
   * Get recent tickets
   */
  recent: orgAuthed
    .route({
      method: 'GET',
      path: '/dashboard/recent',
      summary: 'Get recent tickets',
      tags: ['Dashboard'],
    })
    .input(
      z
        .object({
          limit: z.number().int().min(1).max(20).optional().default(5),
        })
        .optional(),
    )
    .output(
      z.object({
        tickets: z.array(z.any()),
      }),
    )
    .handler(async ({ context, input }) => {
      const db = getDb(context)
      const orgId = context.organization.id
      const limit = input?.limit || 5

      const tickets = await db
        .select()
        .from(schema.tickets)
        .where(eq(schema.tickets.organizationId, orgId))
        .orderBy(desc(schema.tickets.createdAt))
        .limit(limit)

      return { tickets }
    }),

  /**
   * Get register statistics
   */
  registerStats: orgAuthed
    .route({
      method: 'GET',
      path: '/dashboard/register-stats',
      summary: 'Get register statistics',
      tags: ['Dashboard'],
    })
    .input(z.object({}).optional())
    .output(
      z.object({
        totalEntries: z.number(),
        totalOpd: z.number(),
        totalStock: z.number(),
        totalBiochemistry: z.number(),
        totalBrucellaRbpt: z.number(),
        totalBrucellaSero: z.number(),
        totalFmd: z.number(),
        totalBirdFlu: z.number(),
        totalAbst: z.number(),
        totalDailyExpenditure: z.number(),
        totalPsksCashbook: z.number(),
        totalPsksEntry: z.number(),
        totalLedger: z.number(),
        totalDispatch: z.number(),
        totalPsksLedger: z.number(),
        totalPsksStock: z.number(),
        recentEntries: z.array(z.any()),
        registerTypeCounts: z.array(
          z.object({
            type: z.string(),
            count: z.number(),
          }),
        ),
      }),
    )
    .handler(async ({ context }) => {
      const db = getDb(context)
      const orgId = context.organization.id

      // Count all register types
      const [
        entryCount,
        opdCount,
        stockCount,
        biochemistryCount,
        brucellaRbptCount,
        brucellaSeroCount,
        fmdCount,
        birdFluCount,
        abstCount,
        dailyExpenditureCount,
        psksCashbookCount,
        psksEntryCount,
        ledgerCount,
        dispatchCount,
        psksLedgerCount,
        psksStockCount,
      ] = await Promise.all([
        db
          .select({ count: count() })
          .from(schema.entryRegisters)
          .where(eq(schema.entryRegisters.organizationId, orgId))
          .then((r) => r[0]?.count || 0),
        db
          .select({ count: count() })
          .from(schema.opdRegisters)
          .where(eq(schema.opdRegisters.organizationId, orgId))
          .then((r) => r[0]?.count || 0),
        db
          .select({ count: count() })
          .from(schema.stockRegisters)
          .where(eq(schema.stockRegisters.organizationId, orgId))
          .then((r) => r[0]?.count || 0),
        db
          .select({ count: count() })
          .from(schema.biochemistryRegisters)
          .where(eq(schema.biochemistryRegisters.organizationId, orgId))
          .then((r) => r[0]?.count || 0),
        db
          .select({ count: count() })
          .from(schema.brucellaRbptRegisters)
          .where(eq(schema.brucellaRbptRegisters.organizationId, orgId))
          .then((r) => r[0]?.count || 0),
        db
          .select({ count: count() })
          .from(schema.brucellaSeroRegisters)
          .where(eq(schema.brucellaSeroRegisters.organizationId, orgId))
          .then((r) => r[0]?.count || 0),
        db
          .select({ count: count() })
          .from(schema.fmdRegisters)
          .where(eq(schema.fmdRegisters.organizationId, orgId))
          .then((r) => r[0]?.count || 0),
        db
          .select({ count: count() })
          .from(schema.birdFluRegisters)
          .where(eq(schema.birdFluRegisters.organizationId, orgId))
          .then((r) => r[0]?.count || 0),
        db
          .select({ count: count() })
          .from(schema.abstRegisters)
          .where(eq(schema.abstRegisters.organizationId, orgId))
          .then((r) => r[0]?.count || 0),
        db
          .select({ count: count() })
          .from(schema.dailyExpenditureRegisters)
          .where(eq(schema.dailyExpenditureRegisters.organizationId, orgId))
          .then((r) => r[0]?.count || 0),
        db
          .select({ count: count() })
          .from(schema.psksCashbookRegisters)
          .where(eq(schema.psksCashbookRegisters.organizationId, orgId))
          .then((r) => r[0]?.count || 0),
        db
          .select({ count: count() })
          .from(schema.psksEntryRegisters)
          .where(eq(schema.psksEntryRegisters.organizationId, orgId))
          .then((r) => r[0]?.count || 0),
        db
          .select({ count: count() })
          .from(schema.ledgerRegisters)
          .where(eq(schema.ledgerRegisters.organizationId, orgId))
          .then((r) => r[0]?.count || 0),
        db
          .select({ count: count() })
          .from(schema.dispatchRegisters)
          .where(eq(schema.dispatchRegisters.organizationId, orgId))
          .then((r) => r[0]?.count || 0),
        db
          .select({ count: count() })
          .from(schema.psksLedgerRegisters)
          .where(eq(schema.psksLedgerRegisters.organizationId, orgId))
          .then((r) => r[0]?.count || 0),
        db
          .select({ count: count() })
          .from(schema.psksStockRegisters)
          .where(eq(schema.psksStockRegisters.organizationId, orgId))
          .then((r) => r[0]?.count || 0),
      ])

      // Get recent entries (from entry register as example)
      const recentEntries = await db
        .select()
        .from(schema.entryRegisters)
        .where(eq(schema.entryRegisters.organizationId, orgId))
        .orderBy(desc(schema.entryRegisters.createdAt))
        .limit(5)

      const registerTypeCounts = [
        { type: 'Entry', count: entryCount },
        { type: 'OPD', count: opdCount },
        { type: 'Stock', count: stockCount },
        { type: 'Biochemistry', count: biochemistryCount },
        { type: 'Brucella RBPT', count: brucellaRbptCount },
        { type: 'Brucella Sero', count: brucellaSeroCount },
        { type: 'FMD', count: fmdCount },
        { type: 'Bird Flu', count: birdFluCount },
        { type: 'AbSt', count: abstCount },
        { type: 'Daily Expenditure', count: dailyExpenditureCount },
        { type: 'PSKS Cashbook', count: psksCashbookCount },
        { type: 'PSKS Entry', count: psksEntryCount },
        { type: 'Ledger', count: ledgerCount },
        { type: 'Dispatch', count: dispatchCount },
        { type: 'PSKS Ledger', count: psksLedgerCount },
        { type: 'PSKS Stock', count: psksStockCount },
      ]

      return {
        totalEntries: entryCount,
        totalOpd: opdCount,
        totalStock: stockCount,
        totalBiochemistry: biochemistryCount,
        totalBrucellaRbpt: brucellaRbptCount,
        totalBrucellaSero: brucellaSeroCount,
        totalFmd: fmdCount,
        totalBirdFlu: birdFluCount,
        totalAbst: abstCount,
        totalDailyExpenditure: dailyExpenditureCount,
        totalPsksCashbook: psksCashbookCount,
        totalPsksEntry: psksEntryCount,
        totalLedger: ledgerCount,
        totalDispatch: dispatchCount,
        totalPsksLedger: psksLedgerCount,
        totalPsksStock: psksStockCount,
        recentEntries,
        registerTypeCounts,
      }
    }),
}
