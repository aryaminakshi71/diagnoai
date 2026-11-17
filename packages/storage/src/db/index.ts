/**
 * Database Connection
 * 
 * Drizzle ORM database connection setup
 */

import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

// Create postgres connection
const connectionString =
  process.env.DATABASE_URL ??
  'postgres://postgres:postgres@localhost:5432/postgres'

if (!process.env.DATABASE_URL) {
  console.warn(
    'DATABASE_URL is not set. Using default local connection string.',
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
