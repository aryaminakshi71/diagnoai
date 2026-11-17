/**
 * PSKS Stock Register Schema
 * 
 * Tracks PSKS stock (similar to regular stock register)
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

export const psksStockRegisters = pgTable(
  'psks_stock_registers',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    srNo: integer('sr_no'),
    particulars: text('particulars'),
    pageNo: varchar('page_no', { length: 50 }),
    date: date('date'),
    oB: varchar('o_b', { length: 50 }), // Opening Balance
    dateSource: date('date_source'),
    source: varchar('source', { length: 255 }),
    quantity: real('quantity'),
    tQuantity: real('t_quantity'), // Total quantity
    cM: varchar('c_m', { length: 50 }), // Check/Mark
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
    organizationIdIdx: index('idx_psks_stock_registers_organization_id').on(
      table.organizationId,
    ),
    srNoIdx: index('idx_psks_stock_registers_sr_no').on(table.srNo),
    dateIdx: index('idx_psks_stock_registers_date').on(table.date),
    createdAtIdx: index('idx_psks_stock_registers_created_at').on(
      table.createdAt,
    ),
  }),
)

export const psksStockRegistersRelations = relations(
  psksStockRegisters,
  ({ one }) => ({
    organization: one(organizations, {
      fields: [psksStockRegisters.organizationId],
      references: [organizations.id],
    }),
    creator: one(users, {
      fields: [psksStockRegisters.createdBy],
      references: [users.id],
    }),
    updater: one(users, {
      fields: [psksStockRegisters.updatedBy],
      references: [users.id],
    }),
  }),
)
