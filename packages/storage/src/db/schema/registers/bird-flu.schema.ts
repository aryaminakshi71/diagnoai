/**
 * Bird Flu Register Schema
 * 
 * Tracks Avian Influenza (Bird Flu) samples
 * Complex structure with location-based organization
 */

import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  numeric,
  jsonb,
  timestamp,
  index,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { organizations } from '../auth.schema'
import { users } from '../auth.schema'

export const birdFluRegisters = pgTable(
  'bird_flu_registers',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    srNo: integer('sr_no'),
    location: varchar('location', { length: 255 }), // Sonipat, Jalandhar, Bhopal, etc.
    nameAddressTelephoneSender: text('name_address_telephone_sender'),
    villageWardArea: varchar('village_ward_area', { length: 255 }),
    totalSamples: integer('total_samples'),
    poultryType: varchar('poultry_type', { length: 255 }), // Commercial/Backyard
    // Store remaining 25+ flexible fields as JSONB
    flexibleData: jsonb('flexible_data').$type<Record<string, unknown>>(),
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
    organizationIdIdx: index('idx_bird_flu_registers_organization_id').on(
      table.organizationId,
    ),
    locationIdx: index('idx_bird_flu_registers_location').on(table.location),
    srNoIdx: index('idx_bird_flu_registers_sr_no').on(table.srNo),
    createdAtIdx: index('idx_bird_flu_registers_created_at').on(
      table.createdAt,
    ),
  }),
)

export const birdFluRegistersRelations = relations(
  birdFluRegisters,
  ({ one }) => ({
    organization: one(organizations, {
      fields: [birdFluRegisters.organizationId],
      references: [organizations.id],
    }),
    creator: one(users, {
      fields: [birdFluRegisters.createdBy],
      references: [users.id],
    }),
    updater: one(users, {
      fields: [birdFluRegisters.updatedBy],
      references: [users.id],
    }),
  }),
)
