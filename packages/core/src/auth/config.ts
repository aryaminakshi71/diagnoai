/**
 * Better Auth Configuration
 * 
 * Configure Better Auth with PostgreSQL adapter and organization support
 */

import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { organization } from 'better-auth/plugins/organization'
import { db } from '@diagnoai/storage/db'
import { schema } from '@diagnoai/storage/db'

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verifications,
      organization: schema.organizations,
      member: schema.organizationMemberships,
      invitation: schema.invitations,
    },
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Set to true in production
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  advanced: {
    database: {
      generateId: 'uuid',
    },
  },
  plugins: [organization()],
  secret: process.env.BETTER_AUTH_SECRET || 'change-me-in-production',
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
  trustedOrigins: ['http://127.0.0.1:3000', 'http://localhost:3000'],
  basePath: '/api/auth',
})

export type Auth = typeof auth
