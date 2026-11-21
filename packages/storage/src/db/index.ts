/**
 * Database Connection
 * 
 * Drizzle ORM database connection setup
 */

import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

// Create postgres connection. Fail loudly rather than silently connecting to
// a default local database, which would write to the wrong place.
const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error(
    'DATABASE_URL is not set. Copy .env.example to .env and set DATABASE_URL.',
  )
}
// Neon's PgBouncer pooler runs in transaction mode, which does not support
// prepared statements. Disable them when the URL points at a pooler, and keep
// the pool small so serverless instances don't exhaust connections.
const isPooler = connectionString.includes("-pooler.")

const client = postgres(connectionString, {
  max: isPooler ? 5 : 10,
  idle_timeout: 20,
  connect_timeout: 10,
  prepare: !isPooler,
})

// Create drizzle database instance
export const db = drizzle(client, { schema })

// Export schema for use in procedures
export { schema }

// Export types
export type Database = typeof db

// Optional read replica. Set DATABASE_READ_URL to route analytics/dashboard
// reads away from the primary. Falls back to the primary when unset.
const readConnectionString = process.env.DATABASE_READ_URL
const readClient = readConnectionString
  ? postgres(readConnectionString, {
      max: readConnectionString.includes("-pooler.") ? 5 : 10,
      idle_timeout: 20,
      connect_timeout: 10,
      prepare: !readConnectionString.includes("-pooler."),
    })
  : null

export const readDb = readClient ? drizzle(readClient, { schema }) : db

