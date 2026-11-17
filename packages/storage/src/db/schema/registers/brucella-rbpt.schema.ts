/**
 * Brucella RBPT Register Schema
 * 
 * Tracks Brucella Rose Bengal Plate Test samples
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

export const brucellaRbptRegisters = pgTable(
  'brucella_rbpt_registers',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    date: date('date').notNull(),
    yearlyNo: varchar('yearly_no', { length: 50 }),
    monthlyNo: varchar('monthly_no', { length: 50 }),
    dailyNo: varchar('daily_no', { length: 50 }),
    name: varchar('name', { length: 255 }), // Owner name
    village: varchar('village', { length: 255 }),
    gvh: varchar('gvh', { length: 255 }), // Government Veterinary Hospital
    species: varchar('species', { length: 100 }),
    age: varchar('age', { length: 50 }),
    sex: varchar('sex', { length: 10 }), // M/F
    testResult: varchar('test_result', { length: 100 }), // Positive/Negative/Inconclusive
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
    organizationIdIdx: index('idx_brucella_rbpt_registers_organization_id').on(
      table.organizationId,
    ),
    dateIdx: index('idx_brucella_rbpt_registers_date').on(table.date),
    yearlyNoIdx: index('idx_brucella_rbpt_registers_yearly_no').on(
      table.yearlyNo,
    ),
    nameIdx: index('idx_brucella_rbpt_registers_name').on(table.name),
    createdAtIdx: index('idx_brucella_rbpt_registers_created_at').on(
      table.createdAt,
    ),
  }),
)

export const brucellaRbptRegistersRelations = relations(
  brucellaRbptRegisters,
  ({ one }) => ({
    organization: one(organizations, {
      fields: [brucellaRbptRegisters.organizationId],
      references: [organizations.id],
    }),
    creator: one(users, {
      fields: [brucellaRbptRegisters.createdBy],
      references: [users.id],
    }),
    updater: one(users, {
      fields: [brucellaRbptRegisters.updatedBy],
      references: [users.id],
    }),
  }),
)
