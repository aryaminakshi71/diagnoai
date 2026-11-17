/**
 * AbSt Register Schema (Antibiotic Sensitivity Testing)
 * 
 * Tracks antibiotic sensitivity test results
 */

import {
  pgTable,
  uuid,
  varchar,
  text,
  date,
  jsonb,
  timestamp,
  index,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { organizations } from '../auth.schema'
import { users } from '../auth.schema'

// Type for antibiotic sensitivity results
export type AntibioticSensitivity = 'S' | 'R' | 'I' // Sensitive, Resistant, Intermediate

export interface AntibioticResults {
  o?: AntibioticSensitivity // Oxytetracycline
  czx?: AntibioticSensitivity // Cefuroxime
  ex10?: AntibioticSensitivity // EX 10
  ctr?: AntibioticSensitivity // CTR
  ak?: AntibioticSensitivity // Amikacin
  gen10?: AntibioticSensitivity // Gentamicin 10
  cfs?: AntibioticSensitivity // CFS
  ams?: AntibioticSensitivity // AMS
}

export const abstRegisters = pgTable(
  'abst_registers',
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
    sampleType: varchar('sample_type', { length: 100 }),
    referredByGvh: varchar('referred_by_gvh', { length: 255 }),
    history: text('history'),
    earlierTreatmentYesNo: varchar('earlier_treatment_yes_no', {
      length: 10,
    }), // Yes/No
    sampleCodeOnMedia: varchar('sample_code_on_media', { length: 100 }),
    sampleBroughtIn: varchar('sample_brought_in', { length: 100 }),
    bacteriaIsolatedNoGrowth: varchar('bacteria_isolated_no_growth', {
      length: 100,
    }),
    // Store antibiotic sensitivity results as JSONB
    antibioticResults: jsonb('antibiotic_results').$type<AntibioticResults>(),
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
    organizationIdIdx: index('idx_abst_registers_organization_id').on(
      table.organizationId,
    ),
    dateIdx: index('idx_abst_registers_date').on(table.date),
    yearlyNoIdx: index('idx_abst_registers_yearly_no').on(table.yearlyNo),
    ownerNameIdx: index('idx_abst_registers_owner_name').on(table.ownerName),
    sampleCodeIdx: index('idx_abst_registers_sample_code').on(
      table.sampleCodeOnMedia,
    ),
    createdAtIdx: index('idx_abst_registers_created_at').on(table.createdAt),
  }),
)

export const abstRegistersRelations = relations(abstRegisters, ({ one }) => ({
  organization: one(organizations, {
    fields: [abstRegisters.organizationId],
    references: [organizations.id],
  }),
  creator: one(users, {
    fields: [abstRegisters.createdBy],
    references: [users.id],
  }),
  updater: one(users, {
    fields: [abstRegisters.updatedBy],
    references: [users.id],
  }),
}))
