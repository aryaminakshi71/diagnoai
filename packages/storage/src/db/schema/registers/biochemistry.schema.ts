/**
 * Biochemistry Register Schema
 * 
 * Tracks biochemistry test results
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
import { opdRegisters } from './opd.schema'

export const biochemistryRegisters = pgTable(
  'biochemistry_registers',
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
    village: varchar('village', { length: 255 }),
    species: varchar('species', { length: 100 }),
    age: varchar('age', { length: 50 }),
    sex: varchar('sex', { length: 10 }), // M/F
    altUL: real('alt_u_l'), // ALT (u/l) - Alanine Aminotransferase
    ureaMgDl: real('urea_mg_dl'), // Urea (mg/dl)
    glucoseMgDl: real('glucose_mg_dl'), // Glucose (mg/dl)
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
    opdRegisterId: uuid('opd_register_id').references(() => opdRegisters.id, {
      onDelete: 'set null',
    }),
  },
  (table) => ({
    organizationIdIdx: index('idx_biochemistry_registers_organization_id').on(
      table.organizationId,
    ),
    dateIdx: index('idx_biochemistry_registers_date').on(table.date),
    yearlyNoIdx: index('idx_biochemistry_registers_yearly_no').on(
      table.yearlyNo,
    ),
    monthlyNoIdx: index('idx_biochemistry_registers_monthly_no').on(
      table.monthlyNo,
    ),
    dailyNoIdx: index('idx_biochemistry_registers_daily_no').on(
      table.dailyNo,
    ),
    ownerNameIdx: index('idx_biochemistry_registers_owner_name').on(
      table.ownerName,
    ),
    createdAtIdx: index('idx_biochemistry_registers_created_at').on(
      table.createdAt,
    ),
  }),
)

export const biochemistryRegistersRelations = relations(
  biochemistryRegisters,
  ({ one }) => ({
    organization: one(organizations, {
      fields: [biochemistryRegisters.organizationId],
      references: [organizations.id],
    }),
    creator: one(users, {
      fields: [biochemistryRegisters.createdBy],
      references: [users.id],
    }),
    updater: one(users, {
      fields: [biochemistryRegisters.updatedBy],
      references: [users.id],
    }),
    opdRegister: one(opdRegisters, {
      fields: [biochemistryRegisters.opdRegisterId],
      references: [opdRegisters.id],
    }),
  }),
)
