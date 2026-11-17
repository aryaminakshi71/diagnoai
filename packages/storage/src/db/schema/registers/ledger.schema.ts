/**
 * Ledger Register Schema
 * 
 * Tracks ledger entries for articles
 */

import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  real,
  date,
  timestamp,
  index,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { organizations } from '../auth.schema'
import { users } from '../auth.schema'

export const ledgerRegisters = pgTable(
  'ledger_registers',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    srNo: integer('sr_no'),
    nameOfArticle: varchar('name_of_article', { length: 255 }),
    dateOfSupply: date('date_of_supply'),
    qtyInHands: real('qty_in_hands'),
    receivingDateDddLab: date('receiving_date_ddd_lab'),
    receivedDate: date('received_date'),
    receivedSource: varchar('received_source', { length: 255 }),
    quantity: real('quantity'),
    totalQty: real('total_qty'),
    servicable: varchar('servicable', { length: 50 }),
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
    organizationIdIdx: index('idx_ledger_registers_organization_id').on(
      table.organizationId,
    ),
    srNoIdx: index('idx_ledger_registers_sr_no').on(table.srNo),
    nameOfArticleIdx: index('idx_ledger_registers_name_of_article').on(
      table.nameOfArticle,
    ),
    createdAtIdx: index('idx_ledger_registers_created_at').on(table.createdAt),
  }),
)

export const ledgerRegistersRelations = relations(
  ledgerRegisters,
  ({ one }) => ({
    organization: one(organizations, {
      fields: [ledgerRegisters.organizationId],
      references: [organizations.id],
    }),
    creator: one(users, {
      fields: [ledgerRegisters.createdBy],
      references: [users.id],
    }),
    updater: one(users, {
      fields: [ledgerRegisters.updatedBy],
      references: [users.id],
    }),
  }),
)
