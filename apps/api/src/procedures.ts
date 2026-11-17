/**
 * oRPC Procedures
 *
 * Procedure factories with authentication middleware
 * - pub: Public procedures (no auth required)
 * - authed: Authenticated procedures (user required)
 * - orgAuthed: Organization-authenticated procedures (user + organization membership required)
 */

import { os } from "@orpc/server"
import { db, schema } from "@diagnoai/storage/db"
import type { Database } from "@diagnoai/storage/db"

export interface Logger {
  info: (...args: any[]) => void
  error: (...args: any[]) => void
  warn: (...args: any[]) => void
  debug: (...args: any[]) => void
}

// Context types
export interface PublicContext {
  request?: Request
  logger: Logger
  env: Record<string, unknown>
}

export interface AuthedContext extends PublicContext {
  user: {
    id: string
    email: string
    name: string | null
    image: string | null
  }
}

export interface OrgAuthedContext extends AuthedContext {
  organization: {
    id: string
    name: string
    slug: string
    plan: string
  }
  membership: {
    id: string
    role: string
  }
}

// Helper to get database instance from context
export function getDb(_context: AuthedContext | OrgAuthedContext): Database {
  return db
}

// Export schema for use in routers
export { schema }

// Base procedure with initial context
const base = os.$context<PublicContext>()

// Public procedure (no authentication required)
export const pub = base

// Authenticated procedure (stubbed for local dev)
export const authed = base.use<AuthedContext>(async ({ context, next }) => {
  const user =
    (context as Partial<AuthedContext>).user ?? {
      id: "00000000-0000-0000-0000-000000000002",
      email: "dev@example.com",
      name: "Dev User",
      image: null,
    }

  return next({
    context: {
      ...context,
      user,
    },
  })
})

// Organization-authenticated procedure (stubbed for local dev)
export const orgAuthed = authed.use<OrgAuthedContext>(async ({ context, next }) => {
  const organization =
    (context as Partial<OrgAuthedContext>).organization ?? {
      id: "00000000-0000-0000-0000-000000000001",
      name: "Dev Organization",
      slug: "dev",
      plan: "free",
    }

  const membership =
    (context as Partial<OrgAuthedContext>).membership ?? {
      id: "00000000-0000-0000-0000-000000000003",
      role: "owner",
    }

  return next({
    context: {
      ...context,
      organization,
      membership,
    },
  })
})
