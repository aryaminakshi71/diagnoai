/**
 * FMD Register Schema
 * 
 * Tracks Foot and Mouth Disease samples
 */

import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  numeric,
  date,
  timestamp,
  index,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { organizations } from '../auth.schema'
import { users } from '../auth.schema'

export const fmdRegisters = pgTable(
  'fmd_registers',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    sampleIdCryovialCode: varchar('sample_id_cryovial_code', {
      length: 100,
    }),
    dateOfSampling: date('date_of_sampling').notNull(),
    ownerName: varchar('owner_name', { length: 255 }),
    village: varchar('village', { length: 255 }),
    blockTehsil: varchar('block_tehsil', { length: 255 }),
    district: varchar('district', { length: 255 }),
    pinCode: varchar('pin_code', { length: 10 }),
    species: varchar('species', { length: 100 }),
    ageMonths: integer('age_months'),
    sex: varchar('sex', { length: 10 }), // M/F
    clinicalSigns: text('clinical_signs'),
    testResult: varchar('test_result', { length: 100 }),
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
    organizationIdIdx: index('idx_fmd_registers_organization_id').on(
      table.organizationId,
    ),
    sampleIdIdx: index('idx_fmd_registers_sample_id').on(
      table.sampleIdCryovialCode,
    ),
    dateOfSamplingIdx: index('idx_fmd_registers_date_of_sampling').on(
      table.dateOfSampling,
    ),
    ownerNameIdx: index('idx_fmd_registers_owner_name').on(table.ownerName),
    districtIdx: index('idx_fmd_registers_district').on(table.district),
    createdAtIdx: index('idx_fmd_registers_created_at').on(table.createdAt),
  }),
)

export const fmdRegistersRelations = relations(fmdRegisters, ({ one }) => ({
  organization: one(organizations, {
    fields: [fmdRegisters.organizationId],
    references: [organizations.id],
  }),
  creator: one(users, {
    fields: [fmdRegisters.createdBy],
    references: [users.id],
  }),
  updater: one(users, {
    fields: [fmdRegisters.updatedBy],
    references: [users.id],
  }),
}))
