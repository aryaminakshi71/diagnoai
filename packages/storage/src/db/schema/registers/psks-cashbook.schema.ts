/**
 * PSKS Cashbook Register Schema
 * 
 * Tracks PSKS cashbook entries
 */

import {
  pgTable,
  uuid,
  varchar,
  text,
  real,
  date,
  timestamp,
  index,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { organizations } from '../auth.schema'
import { users } from '../auth.schema'

export const psksCashbookRegisters = pgTable(
  'psks_cashbook_registers',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    date: date('date').notNull(),
    particulars: text('particulars'),
    oB: varchar('o_b', { length: 50 }), // Opening Balance
    dateExpenditure: date('date_expenditure'),
    particularsExpenditure: text('particulars_expenditure'),
    expenditure: real('expenditure'),
    debitedAmount: real('debited_amount'),
    cB: varchar('c_b', { length: 50 }), // Closing Balance
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
    organizationIdIdx: index('idx_psks_cashbook_registers_organization_id').on(
      table.organizationId,
    ),
    dateIdx: index('idx_psks_cashbook_registers_date').on(table.date),
    createdAtIdx: index('idx_psks_cashbook_registers_created_at').on(
      table.createdAt,
    ),
  }),
)

export const psksCashbookRegistersRelations = relations(
  psksCashbookRegisters,
  ({ one }) => ({
    organization: one(organizations, {
      fields: [psksCashbookRegisters.organizationId],
      references: [organizations.id],
    }),
    creator: one(users, {
      fields: [psksCashbookRegisters.createdBy],
      references: [users.id],
    }),
    updater: one(users, {
      fields: [psksCashbookRegisters.updatedBy],
      references: [users.id],
    }),
  }),
)
