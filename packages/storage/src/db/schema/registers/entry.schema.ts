/**
 * Entry Register Schema
 * 
 * Tracks incoming articles/goods received in the lab
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

export const entryRegisters = pgTable(
  'entry_registers',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    invoice: varchar('invoice', { length: 100 }),
    receivingDate: date('receiving_date').notNull(),
    nameOfArticle: varchar('name_of_article', { length: 255 }).notNull(),
    packSize: varchar('pack_size', { length: 100 }),
    quantity: real('quantity').notNull(),
    rate: real('rate'),
    gstPercent: real('gst_percent'),
    rateWithGst: real('rate_with_gst'),
    totalWithGst: real('total_with_gst'),
    source: varchar('source', { length: 255 }),
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
    organizationIdIdx: index('idx_entry_registers_organization_id').on(
      table.organizationId,
    ),
    receivingDateIdx: index('idx_entry_registers_receiving_date').on(
      table.receivingDate,
    ),
    invoiceIdx: index('idx_entry_registers_invoice').on(table.invoice),
    createdAtIdx: index('idx_entry_registers_created_at').on(table.createdAt),
  }),
)

export const entryRegistersRelations = relations(entryRegisters, ({ one }) => ({
  organization: one(organizations, {
    fields: [entryRegisters.organizationId],
    references: [organizations.id],
  }),
  creator: one(users, {
    fields: [entryRegisters.createdBy],
    references: [users.id],
  }),
  updater: one(users, {
    fields: [entryRegisters.updatedBy],
    references: [users.id],
  }),
}))
