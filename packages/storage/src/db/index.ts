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
const client = postgres(connectionString, {
  max: 10,
})

// Create drizzle database instance
export const db = drizzle(client, { schema })

// Export schema for use in procedures
export { schema }

// Export types
export type Database = typeof db
