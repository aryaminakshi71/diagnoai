/**
 * Dispatch Register Schema
 * 
 * Tracks dispatched items/documents
 */

import {
  pgTable,
  uuid,
  varchar,
  text,
  date,
  timestamp,
  index,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { organizations } from '../auth.schema'
import { users } from '../auth.schema'

export const dispatchRegisters = pgTable(
  'dispatch_registers',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    dNo: varchar('d_no', { length: 100 }), // Dispatch number
    date: date('date').notNull(),
    to: varchar('to', { length: 255 }), // Recipient
    subject: text('subject'),
    remarks: text('remarks'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    createdBy: uuid('created_by')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    updatedBy: uuid('updated_by').references(() => users.id, {
      onDelete: 'set null',
    }),
  },
  (table) => ({
    organizationIdIdx: index('idx_dispatch_registers_organization_id').on(
      table.organizationId,
    ),
    dNoIdx: index('idx_dispatch_registers_d_no').on(table.dNo),
    dateIdx: index('idx_dispatch_registers_date').on(table.date),
    createdAtIdx: index('idx_dispatch_registers_created_at').on(
      table.createdAt,
    ),
  }),
)

export const dispatchRegistersRelations = relations(
  dispatchRegisters,
  ({ one }) => ({
    organization: one(organizations, {
      fields: [dispatchRegisters.organizationId],
      references: [organizations.id],
    }),
    creator: one(users, {
      fields: [dispatchRegisters.createdBy],
      references: [users.id],
    }),
    updater: one(users, {
      fields: [dispatchRegisters.updatedBy],
      references: [users.id],
    }),
  }),
)
