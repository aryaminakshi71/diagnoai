/**
 * OPD Register Schema
 * 
 * Tracks Outpatient Department samples and tests
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

export const opdRegisters = pgTable(
  'opd_registers',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    date: date('date').notNull(),
    yearlyNo: varchar('yearly_no', { length: 50 }),
    monthlyNo: varchar('monthly_no', { length: 50 }),
    dailyNo: varchar('daily_no', { length: 50 }),
    ownerName: varchar('owner_name', { length: 255 }),
    address: text('address'),
    species: varchar('species', { length: 100 }),
    sampleCode: varchar('sample_code', { length: 100 }),
    testPerformed: varchar('test_performed', { length: 255 }),
    result: text('result'),
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
    organizationIdIdx: index('idx_opd_registers_organization_id').on(
      table.organizationId,
    ),
    dateIdx: index('idx_opd_registers_date').on(table.date),
    yearlyNoIdx: index('idx_opd_registers_yearly_no').on(table.yearlyNo),
    monthlyNoIdx: index('idx_opd_registers_monthly_no').on(table.monthlyNo),
    dailyNoIdx: index('idx_opd_registers_daily_no').on(table.dailyNo),
    ownerNameIdx: index('idx_opd_registers_owner_name').on(table.ownerName),
    sampleCodeIdx: index('idx_opd_registers_sample_code').on(table.sampleCode),
    createdAtIdx: index('idx_opd_registers_created_at').on(table.createdAt),
  }),
)

export const opdRegistersRelations = relations(opdRegisters, ({ one }) => ({
  organization: one(organizations, {
    fields: [opdRegisters.organizationId],
    references: [organizations.id],
  }),
  creator: one(users, {
    fields: [opdRegisters.createdBy],
    references: [users.id],
  }),
  updater: one(users, {
    fields: [opdRegisters.updatedBy],
    references: [users.id],
  }),
}))
