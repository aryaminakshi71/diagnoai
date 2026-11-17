/**
 * Brucella Sero Surveillance Register Schema
 * 
 * Tracks Brucella serological surveillance samples
 */

import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  date,
  timestamp,
  index,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { organizations } from '../auth.schema'
import { users } from '../auth.schema'

export const brucellaSeroRegisters = pgTable(
  'brucella_sero_registers',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    srNo: integer('sr_no'),
    ownerName: varchar('owner_name', { length: 255 }),
    village: varchar('village', { length: 255 }),
    nameOfGvh: varchar('name_of_gvh', { length: 255 }),
    species: varchar('species', { length: 100 }),
    age: varchar('age', { length: 50 }),
    sex: varchar('sex', { length: 10 }), // M/F
    tagNo: varchar('tag_no', { length: 100 }),
    dateOfSampling: date('date_of_sampling'),
    dateOfVaccination: date('date_of_vaccination'),
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
    organizationIdIdx: index('idx_brucella_sero_registers_organization_id').on(
      table.organizationId,
    ),
    srNoIdx: index('idx_brucella_sero_registers_sr_no').on(table.srNo),
    ownerNameIdx: index('idx_brucella_sero_registers_owner_name').on(
      table.ownerName,
    ),
    tagNoIdx: index('idx_brucella_sero_registers_tag_no').on(table.tagNo),
    createdAtIdx: index('idx_brucella_sero_registers_created_at').on(
      table.createdAt,
    ),
  }),
)

export const brucellaSeroRegistersRelations = relations(
  brucellaSeroRegisters,
  ({ one }) => ({
    organization: one(organizations, {
      fields: [brucellaSeroRegisters.organizationId],
      references: [organizations.id],
    }),
    creator: one(users, {
      fields: [brucellaSeroRegisters.createdBy],
      references: [users.id],
    }),
    updater: one(users, {
      fields: [brucellaSeroRegisters.updatedBy],
      references: [users.id],
    }),
  }),
)
