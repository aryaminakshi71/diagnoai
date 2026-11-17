/**
 * LIS (Laboratory Information System) Schema
 *
 * Industry-standard human + veterinary laboratory workflow:
 * Patient -> Order -> Sample -> Result -> Report -> Billing
 * Plus inventory and quality control.
 *
 * The legacy government registers (entry/opd/stock/...) remain for
 * backward compatibility and are shown only when VITE_LAB_TYPE=veterinary.
 */

import {
  pgTable,
  uuid,
  varchar,
  text,
  date,
  timestamp,
  real,
  integer,
  boolean,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { organizations, users } from '../auth.schema'

/* ------------------------------------------------------------------ */
/* Patients                                                            */
/* ------------------------------------------------------------------ */

export const patients = pgTable(
  'patients',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    mrn: varchar('mrn', { length: 50 }).notNull(),
    firstName: varchar('first_name', { length: 120 }).notNull(),
    lastName: varchar('last_name', { length: 120 }),
    dateOfBirth: date('date_of_birth'),
    gender: varchar('gender', { length: 20 }),
    // human | veterinary
    labType: varchar('lab_type', { length: 20 }).notNull().default('human'),
    // For veterinary patients: species, breed, owner
    species: varchar('species', { length: 80 }),
    breed: varchar('breed', { length: 80 }),
    ownerName: varchar('owner_name', { length: 200 }),
    phone: varchar('phone', { length: 40 }),
    email: varchar('email', { length: 255 }),
    address: text('address'),
    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    createdBy: uuid('created_by').references(() => users.id, {
      onDelete: 'set null',
    }),
  },
  (table) => ({
    orgIdx: index('idx_patients_org').on(table.organizationId),
    mrnIdx: uniqueIndex('uq_patients_org_mrn').on(
      table.organizationId,
      table.mrn,
    ),
    nameIdx: index('idx_patients_name').on(table.lastName, table.firstName),
    phoneIdx: index('idx_patients_phone').on(table.phone),
  }),
)

/* ------------------------------------------------------------------ */
/* Referring doctors                                                   */
/* ------------------------------------------------------------------ */

export const referringDoctors = pgTable(
  'referring_doctors',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 200 }).notNull(),
    specialization: varchar('specialization', { length: 120 }),
    hospital: varchar('hospital', { length: 200 }),
    phone: varchar('phone', { length: 40 }),
    email: varchar('email', { length: 255 }),
    commissionPercent: real('commission_percent').default(0),
    active: boolean('active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    orgIdx: index('idx_referring_doctors_org').on(table.organizationId),
    nameIdx: index('idx_referring_doctors_name').on(table.name),
  }),
)

/* ------------------------------------------------------------------ */
/* Test catalog + analytes                                             */
/* ------------------------------------------------------------------ */

export const testCatalog = pgTable(
  'test_catalog',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    code: varchar('code', { length: 40 }).notNull(),
    name: varchar('name', { length: 200 }).notNull(),
    category: varchar('category', { length: 80 }),
    sampleType: varchar('sample_type', { length: 80 }),
    // human | veterinary | both
    labType: varchar('lab_type', { length: 20 }).notNull().default('both'),
    price: real('price').notNull().default(0),
    tatHours: integer('tat_hours').default(24),
    method: varchar('method', { length: 120 }),
    active: boolean('active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    orgIdx: index('idx_test_catalog_org').on(table.organizationId),
    codeIdx: uniqueIndex('uq_test_catalog_org_code').on(
      table.organizationId,
      table.code,
    ),
    nameIdx: index('idx_test_catalog_name').on(table.name),
  }),
)

export const testAnalytes = pgTable(
  'test_analytes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    testId: uuid('test_id')
      .notNull()
      .references(() => testCatalog.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 120 }).notNull(),
    unit: varchar('unit', { length: 40 }),
    refLow: real('ref_low'),
    refHigh: real('ref_high'),
    refText: varchar('ref_text', { length: 200 }),
    method: varchar('method', { length: 120 }),
    sortOrder: integer('sort_order').default(0),
  },
  (table) => ({
    testIdx: index('idx_test_analytes_test').on(table.testId),
  }),
)

/* ------------------------------------------------------------------ */
/* Orders                                                              */
/* ------------------------------------------------------------------ */

export const orders = pgTable(
  'orders',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    orderNumber: varchar('order_number', { length: 50 }).notNull(),
    patientId: uuid('patient_id')
      .notNull()
      .references(() => patients.id, { onDelete: 'restrict' }),
    doctorId: uuid('doctor_id').references(() => referringDoctors.id, {
      onDelete: 'set null',
    }),
    // routine | urgent | stat
    priority: varchar('priority', { length: 20 }).notNull().default('routine'),
    // ordered | collected | received | in_progress | resulted | verified | reported | cancelled
    status: varchar('status', { length: 30 }).notNull().default('ordered'),
    orderedAt: timestamp('ordered_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    clinicalNotes: text('clinical_notes'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    createdBy: uuid('created_by').references(() => users.id, {
      onDelete: 'set null',
    }),
  },
  (table) => ({
    orgIdx: index('idx_orders_org').on(table.organizationId),
    numberIdx: uniqueIndex('uq_orders_org_number').on(
      table.organizationId,
      table.orderNumber,
    ),
    patientIdx: index('idx_orders_patient').on(table.patientId),
    statusIdx: index('idx_orders_status').on(table.status),
    orderedAtIdx: index('idx_orders_ordered_at').on(table.orderedAt),
  }),
)

export const orderItems = pgTable(
  'order_items',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    orderId: uuid('order_id')
      .notNull()
      .references(() => orders.id, { onDelete: 'cascade' }),
    testId: uuid('test_id')
      .notNull()
      .references(() => testCatalog.id, { onDelete: 'restrict' }),
    // ordered | in_progress | resulted | verified | cancelled
    status: varchar('status', { length: 30 }).notNull().default('ordered'),
    price: real('price').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    orderIdx: index('idx_order_items_order').on(table.orderId),
    testIdx: index('idx_order_items_test').on(table.testId),
  }),
)

/* ------------------------------------------------------------------ */
/* Samples                                                             */
/* ------------------------------------------------------------------ */

export const samples = pgTable(
  'samples',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    accession: varchar('accession', { length: 50 }).notNull(),
    orderId: uuid('order_id')
      .notNull()
      .references(() => orders.id, { onDelete: 'cascade' }),
    sampleType: varchar('sample_type', { length: 80 }).notNull(),
    container: varchar('container', { length: 80 }),
    collectedAt: timestamp('collected_at', { withTimezone: true }),
    receivedAt: timestamp('received_at', { withTimezone: true }),
    // collected | received | rejected | in_progress | completed
    status: varchar('status', { length: 30 }).notNull().default('collected'),
    rejectionReason: text('rejection_reason'),
    barcode: varchar('barcode', { length: 120 }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    orgIdx: index('idx_samples_org').on(table.organizationId),
    accessionIdx: uniqueIndex('uq_samples_org_accession').on(
      table.organizationId,
      table.accession,
    ),
    orderIdx: index('idx_samples_order').on(table.orderId),
    statusIdx: index('idx_samples_status').on(table.status),
  }),
)

/* ------------------------------------------------------------------ */
/* Results                                                             */
/* ------------------------------------------------------------------ */

export const results = pgTable(
  'results',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    sampleId: uuid('sample_id')
      .notNull()
      .references(() => samples.id, { onDelete: 'cascade' }),
    orderItemId: uuid('order_item_id')
      .notNull()
      .references(() => orderItems.id, { onDelete: 'cascade' }),
    analyteId: uuid('analyte_id').references(() => testAnalytes.id, {
      onDelete: 'set null',
    }),
    value: varchar('value', { length: 200 }),
    numericValue: real('numeric_value'),
    unit: varchar('unit', { length: 40 }),
    // normal | low | high | critical_low | critical_high | abnormal
    flag: varchar('flag', { length: 20 }),
    refLow: real('ref_low'),
    refHigh: real('ref_high'),
    comment: text('comment'),
    // pending | entered | verified | amended
    status: varchar('status', { length: 20 }).notNull().default('pending'),
    enteredBy: uuid('entered_by').references(() => users.id, {
      onDelete: 'set null',
    }),
    enteredAt: timestamp('entered_at', { withTimezone: true }),
    verifiedBy: uuid('verified_by').references(() => users.id, {
      onDelete: 'set null',
    }),
    verifiedAt: timestamp('verified_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    sampleIdx: index('idx_results_sample').on(table.sampleId),
    itemIdx: index('idx_results_order_item').on(table.orderItemId),
    statusIdx: index('idx_results_status').on(table.status),
  }),
)

/* ------------------------------------------------------------------ */
/* Reports                                                             */
/* ------------------------------------------------------------------ */

export const reports = pgTable(
  'reports',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    orderId: uuid('order_id')
      .notNull()
      .references(() => orders.id, { onDelete: 'cascade' }),
    reportNumber: varchar('report_number', { length: 50 }).notNull(),
    // draft | final | amended | delivered
    status: varchar('status', { length: 20 }).notNull().default('draft'),
    generatedAt: timestamp('generated_at', { withTimezone: true }),
    deliveredAt: timestamp('delivered_at', { withTimezone: true }),
    deliveryChannel: varchar('delivery_channel', { length: 40 }),
    pdfUrl: text('pdf_url'),
    remarks: text('remarks'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    orgIdx: index('idx_reports_org').on(table.organizationId),
    orderIdx: index('idx_reports_order').on(table.orderId),
    numberIdx: uniqueIndex('uq_reports_org_number').on(
      table.organizationId,
      table.reportNumber,
    ),
  }),
)

/* ------------------------------------------------------------------ */
/* Billing                                                             */
/* ------------------------------------------------------------------ */

export const invoices = pgTable(
  'invoices',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    orderId: uuid('order_id').references(() => orders.id, {
      onDelete: 'set null',
    }),
    invoiceNumber: varchar('invoice_number', { length: 50 }).notNull(),
    subtotal: real('subtotal').notNull().default(0),
    discount: real('discount').notNull().default(0),
    taxPercent: real('tax_percent').notNull().default(0),
    taxAmount: real('tax_amount').notNull().default(0),
    total: real('total').notNull().default(0),
    amountPaid: real('amount_paid').notNull().default(0),
    // unpaid | partial | paid | refunded | cancelled
    status: varchar('status', { length: 20 }).notNull().default('unpaid'),
    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    paidAt: timestamp('paid_at', { withTimezone: true }),
  },
  (table) => ({
    orgIdx: index('idx_invoices_org').on(table.organizationId),
    orderIdx: index('idx_invoices_order').on(table.orderId),
    numberIdx: uniqueIndex('uq_invoices_org_number').on(
      table.organizationId,
      table.invoiceNumber,
    ),
    statusIdx: index('idx_invoices_status').on(table.status),
  }),
)

export const payments = pgTable(
  'payments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    invoiceId: uuid('invoice_id')
      .notNull()
      .references(() => invoices.id, { onDelete: 'cascade' }),
    amount: real('amount').notNull(),
    // cash | card | upi | bank | insurance | other
    method: varchar('method', { length: 30 }).notNull().default('cash'),
    reference: varchar('reference', { length: 120 }),
    paidAt: timestamp('paid_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    receivedBy: uuid('received_by').references(() => users.id, {
      onDelete: 'set null',
    }),
  },
  (table) => ({
    invoiceIdx: index('idx_payments_invoice').on(table.invoiceId),
  }),
)

/* ------------------------------------------------------------------ */
/* Inventory                                                           */
/* ------------------------------------------------------------------ */

export const inventoryItems = pgTable(
  'inventory_items',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 200 }).notNull(),
    // reagent | consumable | control | calibrator | other
    category: varchar('category', { length: 40 }).notNull().default('reagent'),
    unit: varchar('unit', { length: 40 }),
    quantity: real('quantity').notNull().default(0),
    reorderLevel: real('reorder_level').notNull().default(0),
    lotNumber: varchar('lot_number', { length: 80 }),
    expiryDate: date('expiry_date'),
    supplier: varchar('supplier', { length: 200 }),
    unitCost: real('unit_cost'),
    active: boolean('active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    orgIdx: index('idx_inventory_items_org').on(table.organizationId),
    nameIdx: index('idx_inventory_items_name').on(table.name),
  }),
)

export const inventoryTransactions = pgTable(
  'inventory_transactions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    itemId: uuid('item_id')
      .notNull()
      .references(() => inventoryItems.id, { onDelete: 'cascade' }),
    // in | out | adjust | discard
    type: varchar('type', { length: 20 }).notNull(),
    quantity: real('quantity').notNull(),
    reference: varchar('reference', { length: 120 }),
    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    createdBy: uuid('created_by').references(() => users.id, {
      onDelete: 'set null',
    }),
  },
  (table) => ({
    itemIdx: index('idx_inventory_tx_item').on(table.itemId),
  }),
)

/* ------------------------------------------------------------------ */
/* Quality control                                                     */
/* ------------------------------------------------------------------ */

export const qcRuns = pgTable(
  'qc_runs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    testId: uuid('test_id')
      .notNull()
      .references(() => testCatalog.id, { onDelete: 'cascade' }),
    // normal | abnormal | low | high
    level: varchar('level', { length: 20 }).notNull().default('normal'),
    lotNumber: varchar('lot_number', { length: 80 }),
    runDate: date('run_date').notNull(),
    // pass | fail | warning
    status: varchar('status', { length: 20 }).notNull().default('pass'),
    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    createdBy: uuid('created_by').references(() => users.id, {
      onDelete: 'set null',
    }),
  },
  (table) => ({
    orgIdx: index('idx_qc_runs_org').on(table.organizationId),
    testIdx: index('idx_qc_runs_test').on(table.testId),
    dateIdx: index('idx_qc_runs_date').on(table.runDate),
  }),
)

export const qcResults = pgTable(
  'qc_results',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    runId: uuid('run_id')
      .notNull()
      .references(() => qcRuns.id, { onDelete: 'cascade' }),
    analyteId: uuid('analyte_id').references(() => testAnalytes.id, {
      onDelete: 'set null',
    }),
    value: real('value').notNull(),
    mean: real('mean'),
    sd: real('sd'),
    cv: real('cv'),
    // in_control | out_of_control
    flag: varchar('flag', { length: 20 }),
  },
  (table) => ({
    runIdx: index('idx_qc_results_run').on(table.runId),
  }),
)

/* ------------------------------------------------------------------ */
/* Relations                                                           */
/* ------------------------------------------------------------------ */

export const patientsRelations = relations(patients, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [patients.organizationId],
    references: [organizations.id],
  }),
  orders: many(orders),
}))

export const ordersRelations = relations(orders, ({ one, many }) => ({
  patient: one(patients, {
    fields: [orders.patientId],
    references: [patients.id],
  }),
  doctor: one(referringDoctors, {
    fields: [orders.doctorId],
    references: [referringDoctors.id],
  }),
  items: many(orderItems),
  samples: many(samples),
  reports: many(reports),
}))

export const orderItemsRelations = relations(orderItems, ({ one, many }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  test: one(testCatalog, {
    fields: [orderItems.testId],
    references: [testCatalog.id],
  }),
  results: many(results),
}))

export const samplesRelations = relations(samples, ({ one, many }) => ({
  order: one(orders, {
    fields: [samples.orderId],
    references: [orders.id],
  }),
  results: many(results),
}))

export const resultsRelations = relations(results, ({ one }) => ({
  sample: one(samples, {
    fields: [results.sampleId],
    references: [samples.id],
  }),
  orderItem: one(orderItems, {
    fields: [results.orderItemId],
    references: [orderItems.id],
  }),
  analyte: one(testAnalytes, {
    fields: [results.analyteId],
    references: [testAnalytes.id],
  }),
}))

export const testCatalogRelations = relations(testCatalog, ({ many }) => ({
  analytes: many(testAnalytes),
  orderItems: many(orderItems),
}))

export const testAnalytesRelations = relations(testAnalytes, ({ one }) => ({
  test: one(testCatalog, {
    fields: [testAnalytes.testId],
    references: [testCatalog.id],
  }),
}))

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  order: one(orders, {
    fields: [invoices.orderId],
    references: [orders.id],
  }),
  payments: many(payments),
}))

export const paymentsRelations = relations(payments, ({ one }) => ({
  invoice: one(invoices, {
    fields: [payments.invoiceId],
    references: [invoices.id],
  }),
}))

export const inventoryItemsRelations = relations(
  inventoryItems,
  ({ many }) => ({
    transactions: many(inventoryTransactions),
  }),
)

export const inventoryTransactionsRelations = relations(
  inventoryTransactions,
  ({ one }) => ({
    item: one(inventoryItems, {
      fields: [inventoryTransactions.itemId],
      references: [inventoryItems.id],
    }),
  }),
)

export const qcRunsRelations = relations(qcRuns, ({ one, many }) => ({
  test: one(testCatalog, {
    fields: [qcRuns.testId],
    references: [testCatalog.id],
  }),
  results: many(qcResults),
}))

export const qcResultsRelations = relations(qcResults, ({ one }) => ({
  run: one(qcRuns, {
    fields: [qcResults.runId],
    references: [qcRuns.id],
  }),
  analyte: one(testAnalytes, {
    fields: [qcResults.analyteId],
    references: [testAnalytes.id],
  }),
}))
