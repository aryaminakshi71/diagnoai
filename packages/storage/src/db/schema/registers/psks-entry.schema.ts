/**
 * PSKS Entry Register Schema
 * 
 * Tracks PSKS entry records with HSN codes
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

export const psksEntryRegisters = pgTable(
  'psks_entry_registers',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    srNo: integer('sr_no'),
    dateOfBill: date('date_of_bill').notNull(),
    descriptionOfGoodsServices: text('description_of_goods_services'),
    quantity: real('quantity'),
    hsnCode: varchar('hsn_code', { length: 50 }),
    ratePerItem: real('rate_per_item'),
    totalAmount: real('total_amount'),
    source: varchar('source', { length: 255 }),
    billInvoiceNo: varchar('bill_invoice_no', { length: 100 }),
    remark: text('remark'),
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
    organizationIdIdx: index('idx_psks_entry_registers_organization_id').on(
      table.organizationId,
    ),
    srNoIdx: index('idx_psks_entry_registers_sr_no').on(table.srNo),
    dateOfBillIdx: index('idx_psks_entry_registers_date_of_bill').on(
      table.dateOfBill,
    ),
    billInvoiceNoIdx: index('idx_psks_entry_registers_bill_invoice_no').on(
      table.billInvoiceNo,
    ),
    createdAtIdx: index('idx_psks_entry_registers_created_at').on(
      table.createdAt,
    ),
  }),
)

export const psksEntryRegistersRelations = relations(
  psksEntryRegisters,
  ({ one }) => ({
    organization: one(organizations, {
      fields: [psksEntryRegisters.organizationId],
      references: [organizations.id],
    }),
    creator: one(users, {
      fields: [psksEntryRegisters.createdBy],
      references: [users.id],
    }),
    updater: one(users, {
      fields: [psksEntryRegisters.updatedBy],
      references: [users.id],
    }),
  }),
)
