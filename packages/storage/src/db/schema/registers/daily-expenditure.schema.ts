/**
 * Daily Expenditure Register Schema
 * 
 * Tracks daily expenditures with monthly structure
 * Normalized: Main table + entries table for daily amounts
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

// Main daily expenditure register
export const dailyExpenditureRegisters = pgTable(
  'daily_expenditure_registers',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    sno: integer('sno'),
    particulars: text('particulars').notNull(),
    oB: varchar('o_b', { length: 50 }), // Opening Balance
    month: integer('month'), // 1-12
    year: integer('year'),
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
    organizationIdIdx: index(
      'idx_daily_expenditure_registers_organization_id',
    ).on(table.organizationId),
    monthYearIdx: index('idx_daily_expenditure_registers_month_year').on(
      table.month,
      table.year,
    ),
    createdAtIdx: index('idx_daily_expenditure_registers_created_at').on(
      table.createdAt,
    ),
  }),
)

// Daily expenditure entries (one per day, 1-31)
export const dailyExpenditureEntries = pgTable(
  'daily_expenditure_entries',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    registerId: uuid('register_id')
      .notNull()
      .references(() => dailyExpenditureRegisters.id, {
        onDelete: 'cascade',
      }),
    dayNumber: integer('day_number').notNull(), // 1-31
    amount: real('amount'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    registerIdIdx: index('idx_daily_expenditure_entries_register_id').on(
      table.registerId,
    ),
    dayNumberIdx: index('idx_daily_expenditure_entries_day_number').on(
      table.dayNumber,
    ),
  }),
)

export const dailyExpenditureRegistersRelations = relations(
  dailyExpenditureRegisters,
  ({ one, many }) => ({
    organization: one(organizations, {
      fields: [dailyExpenditureRegisters.organizationId],
      references: [organizations.id],
    }),
    creator: one(users, {
      fields: [dailyExpenditureRegisters.createdBy],
      references: [users.id],
    }),
    updater: one(users, {
      fields: [dailyExpenditureRegisters.updatedBy],
      references: [users.id],
    }),
    entries: many(dailyExpenditureEntries),
  }),
)

export const dailyExpenditureEntriesRelations = relations(
  dailyExpenditureEntries,
  ({ one }) => ({
    register: one(dailyExpenditureRegisters, {
      fields: [dailyExpenditureEntries.registerId],
      references: [dailyExpenditureRegisters.id],
    }),
  }),
)
