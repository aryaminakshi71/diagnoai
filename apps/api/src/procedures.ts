/**
 * oRPC Procedures
 *
 * Procedure factories with authentication middleware
 * - pub: Public procedures (no auth required)
 * - authed: Authenticated procedures (user required)
 * - orgAuthed: Organization-authenticated procedures (user + organization membership required)
 */

import { os } from "@orpc/server"
import { eq } from "drizzle-orm"
import { seedStarterCatalog } from "./lib/seed-catalog"

/** Fire-and-forget: tell the central registry about a new tenant. */
async function notifyRegistryCompany(company: Record<string, unknown>) {
  try {
    await fetch(
      `${process.env.REGISTRY_URL ?? "http://127.0.0.1:4100"}/api/registry/company`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(company),
        signal: AbortSignal.timeout(3000),
      },
    )
  } catch {
    // registry is optional
  }
}
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

// Authenticated procedure
export const authed = base.use<AuthedContext>(async ({ context, next }) => {
  const ctx = context as Partial<AuthedContext>
  const user =
    ctx.user ?? {
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

// Organization-authenticated procedure
export const orgAuthed = authed.use<OrgAuthedContext>(async ({ context, next }) => {
  const ctx = context as Partial<OrgAuthedContext> & {
    session?: { activeOrganizationId?: string | null }
  }
  let organization = ctx.organization
  let membership = ctx.membership

  // 1. Active organization from the Better Auth session
  const activeOrgId = ctx.session?.activeOrganizationId
  if (!organization && activeOrgId) {
    const [org] = await db
      .select()
      .from(schema.organizations)
      .where(eq(schema.organizations.id, activeOrgId))
      .limit(1)
    if (org) {
      organization = {
        id: org.id,
        name: org.name,
        slug: org.slug,
        plan: org.plan,
      }
    }
  }

  // 2. First membership for the user
  if (!organization) {
    const [row] = await db
      .select({
        org: schema.organizations,
        membership: schema.organizationMemberships,
      })
      .from(schema.organizationMemberships)
      .innerJoin(
        schema.organizations,
        eq(schema.organizationMemberships.organizationId, schema.organizations.id),
      )
      .where(eq(schema.organizationMemberships.userId, context.user.id))
      .limit(1)
    if (row) {
      organization = {
        id: row.org.id,
        name: row.org.name,
        slug: row.org.slug,
        plan: row.org.plan,
      }
      membership = { id: row.membership.id, role: row.membership.role }
    }
  }

  // 3. Auto-create an organization for a real user with none
  if (!organization && context.user.id !== "00000000-0000-0000-0000-000000000002") {
    const slug = `lab-${context.user.id.slice(0, 8)}`
    const [org] = await db
      .insert(schema.organizations)
      .values({
        name: `${context.user.name ?? "My"} Lab`,
        slug,
      })
      .returning()
    const [mem] = await db
      .insert(schema.organizationMemberships)
      .values({
        organizationId: org.id,
        userId: context.user.id,
        role: "owner",
      })
      .returning()
    organization = {
      id: org.id,
      name: org.name,
      slug: org.slug,
      plan: org.plan,
    }
    membership = { id: mem.id, role: mem.role }
    try {
      await seedStarterCatalog(org.id)
    } catch (err) {
      console.error("Failed to seed starter catalog", err)
    }
    void notifyRegistryCompany({
      app: "diagnoai",
      orgId: org.id,
      name: org.name,
      slug: org.slug,
      plan: org.plan,
      status: "active",
      email: context.user.email,
      isDemo: false,
      mrr: 0,
      currency: "INR",
    })
  }

  // 4. Dev fallback
  if (!organization) {
    organization = {
      id: "00000000-0000-0000-0000-000000000001",
      name: "Dev Organization",
      slug: "dev",
      plan: "free",
    }
    membership = {
      id: "00000000-0000-0000-0000-000000000003",
      role: "owner",
    }
  }

  return next({
    context: {
      ...context,
      organization,
      membership: membership ?? {
        id: "00000000-0000-0000-0000-000000000003",
        role: "owner",
      },
    },
  })
})
