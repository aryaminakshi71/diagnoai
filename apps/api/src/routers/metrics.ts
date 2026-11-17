/**
 * Metrics Router
 *
 * Real, DB-backed operational metrics for the admin dashboard.
 * Protected by the ADMIN_TOKEN env var (x-admin-token header).
 */

import { z } from 'zod'
import { count, eq } from 'drizzle-orm'
import { ORPCError } from '@orpc/server'
import { db, schema } from '@diagnoai/storage/db'
import { pub } from '../procedures'

const PLAN_PRICES: Record<string, number> = {
  free: 0,
  starter: 29,
  growth: 79,
  pro: 149,
  enterprise: 499,
}

export const metricsRouter = {
  get: pub
    .route({
      method: 'GET',
      path: '/metrics',
      summary: 'Admin metrics (DB-backed)',
      tags: ['Admin'],
    })
    .output(z.any())
    .handler(async ({ context }) => {
      const token = context.request?.headers.get('x-admin-token') ?? ''
      if (!context.env.ADMIN_TOKEN || token !== context.env.ADMIN_TOKEN) {
        throw new ORPCError('UNAUTHORIZED', {
          message: 'Invalid or missing admin token',
        })
      }

      const [tenants] = await db
        .select({ n: count() })
        .from(schema.organizations)
      const [users] = await db.select({ n: count() }).from(schema.users)
      const subs = await db
        .select()
        .from(schema.billingSubscriptions)
        .where(eq(schema.billingSubscriptions.status, 'active'))

      const mrr = subs.reduce(
        (acc, s) => acc + (PLAN_PRICES[s.plan] ?? 0),
        0,
      )

      return {
        app: 'diagnoai',
        version: '1.0.0',
        status: 'ok',
        uptimeSeconds: Math.round(process.uptime()),
        tenants: tenants?.n ?? 0,
        users: users?.n ?? 0,
        activeSubscriptions: subs.length,
        mrr,
        currency: 'USD',
        timestamp: new Date().toISOString(),
      }
    }),
}
