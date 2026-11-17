/**
 * Notes Schema
 *
 * Notes are scoped to an organization.
 */

import { pgTable, uuid, varchar, text, timestamp, index } from 'drizzle-orm/pg-core'
import { organizations } from './auth.schema'

export const notes = pgTable(
  'notes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    title: varchar('title', { length: 500 }).notNull(),
    content: text('content'),
    status: varchar('status', { length: 50 }).notNull().default('active'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    organizationIdIdx: index('idx_notes_organization_id').on(
      table.organizationId,
    ),
    statusIdx: index('idx_notes_status').on(table.status),
    createdAtIdx: index('idx_notes_created_at').on(table.createdAt),
  }),
)
