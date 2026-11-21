/**
 * LIS Router
 *
 * Industry-standard laboratory workflow:
 * patients -> doctors -> test catalog -> orders -> samples -> results
 * -> reports -> billing, plus inventory and quality control.
 */

import { z } from 'zod'
import { and, eq, desc, count, ilike, sql } from 'drizzle-orm'
import { ORPCError } from '@orpc/server'
import { orgAuthed, getDb, schema } from '../procedures'
import { getOrCache } from '../lib/cache'
import { trackQuery } from '../lib/db-performance'

const listInput = z
  .object({
    search: z.string().optional(),
    limit: z.coerce.number().int().min(1).max(200).optional().default(50),
    offset: z.coerce.number().int().min(0).optional().default(0),
  })
  .default({})

const idInput = z.object({ id: z.string().uuid() })

/* ------------------------------------------------------------------ */
/* Patients                                                            */
/* ------------------------------------------------------------------ */

const patientInput = z.object({
  mrn: z.string().min(1).max(50),
  firstName: z.string().min(1).max(120),
  lastName: z.string().max(120).optional(),
  dateOfBirth: z.string().optional(),
  gender: z.string().max(20).optional(),
  labType: z.enum(['human', 'veterinary']).optional().default('human'),
  species: z.string().max(80).optional(),
  breed: z.string().max(80).optional(),
  ownerName: z.string().max(200).optional(),
  phone: z.string().max(40).optional(),
  email: z.string().max(255).optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
})

export const patientsRouter = {
  list: orgAuthed
    .route({ method: 'GET', path: '/lis/patients', tags: ['LIS'] })
    .input(listInput)
    .output(z.any())
    .handler(async ({ context, input }) => {
      const db = getDb(context)
      const conditions = [eq(schema.patients.organizationId, context.organization.id)]
      if (input.search) {
        conditions.push(
          sql`(${schema.patients.firstName} ILIKE ${'%' + input.search + '%'} OR ${schema.patients.lastName} ILIKE ${'%' + input.search + '%'} OR ${schema.patients.mrn} ILIKE ${'%' + input.search + '%'} OR ${schema.patients.phone} ILIKE ${'%' + input.search + '%'})`,
        )
      }
      const [rows, [total]] = await Promise.all([
        trackQuery('lis.patients.list', () =>
          db
            .select()
            .from(schema.patients)
            .where(and(...conditions))
            .orderBy(desc(schema.patients.createdAt))
            .limit(input.limit)
            .offset(input.offset),
        ),
        trackQuery('lis.patients.count', () =>
          db
            .select({ count: count() })
            .from(schema.patients)
            .where(and(...conditions)),
        ),
      ])
      return { patients: rows, total: total?.count ?? 0 }
    }),

  get: orgAuthed
    .route({ method: 'GET', path: '/lis/patients/:id', tags: ['LIS'] })
    .input(idInput)
    .output(z.any())
    .handler(async ({ context, input }) => {
      const db = getDb(context)
      const [row] = await db
        .select()
        .from(schema.patients)
        .where(
          and(
            eq(schema.patients.id, input.id),
            eq(schema.patients.organizationId, context.organization.id),
          ),
        )
        .limit(1)
      if (!row) throw new ORPCError('NOT_FOUND', { message: 'Patient not found' })
      return row
    }),

  create: orgAuthed
    .route({ method: 'POST', path: '/lis/patients', tags: ['LIS'] })
    .input(patientInput)
    .output(z.any())
    .handler(async ({ context, input }) => {
      const db = getDb(context)
      const [row] = await db
        .insert(schema.patients)
        .values({
          organizationId: context.organization.id,
          createdBy: context.user.id,
          ...input,
        } as any)
        .returning()
      return row
    }),

  update: orgAuthed
    .route({ method: 'PATCH', path: '/lis/patients/:id', tags: ['LIS'] })
    .input(z.object({ id: z.string().uuid(), data: patientInput.partial() }))
    .output(z.any())
    .handler(async ({ context, input }) => {
      const db = getDb(context)
      const [row] = await db
        .update(schema.patients)
        .set({ ...input.data, updatedAt: new Date() })
        .where(
          and(
            eq(schema.patients.id, input.id),
            eq(schema.patients.organizationId, context.organization.id),
          ),
        )
        .returning()
      if (!row) throw new ORPCError('NOT_FOUND', { message: 'Patient not found' })
      return row
    }),

  delete: orgAuthed
    .route({ method: 'DELETE', path: '/lis/patients/:id', tags: ['LIS'] })
    .input(idInput)
    .output(z.any())
    .handler(async ({ context, input }) => {
      const db = getDb(context)
      await db
        .delete(schema.patients)
        .where(
          and(
            eq(schema.patients.id, input.id),
            eq(schema.patients.organizationId, context.organization.id),
          ),
        )
      return { success: true }
    }),
}

/* ------------------------------------------------------------------ */
/* Referring doctors                                                   */
/* ------------------------------------------------------------------ */

const doctorInput = z.object({
  name: z.string().min(1).max(200),
  specialization: z.string().max(120).optional(),
  hospital: z.string().max(200).optional(),
  phone: z.string().max(40).optional(),
  email: z.string().max(255).optional(),
  commissionPercent: z.number().optional(),
  active: z.boolean().optional(),
})

export const doctorsRouter = {
  list: orgAuthed
    .route({ method: 'GET', path: '/lis/doctors', tags: ['LIS'] })
    .input(listInput)
    .output(z.any())
    .handler(async ({ context, input }) => {
      const db = getDb(context)
      const conditions = [
        eq(schema.referringDoctors.organizationId, context.organization.id),
      ]
      if (input.search) {
        conditions.push(ilike(schema.referringDoctors.name, `%${input.search}%`))
      }
      const rows = await db
        .select()
        .from(schema.referringDoctors)
        .where(and(...conditions))
        .orderBy(desc(schema.referringDoctors.createdAt))
        .limit(input.limit)
        .offset(input.offset)
      return { doctors: rows }
    }),

  create: orgAuthed
    .route({ method: 'POST', path: '/lis/doctors', tags: ['LIS'] })
    .input(doctorInput)
    .output(z.any())
    .handler(async ({ context, input }) => {
      const db = getDb(context)
      const [row] = await db
        .insert(schema.referringDoctors)
        .values({ organizationId: context.organization.id, ...input } as any)
        .returning()
      return row
    }),

  update: orgAuthed
    .route({ method: 'PATCH', path: '/lis/doctors/:id', tags: ['LIS'] })
    .input(z.object({ id: z.string().uuid(), data: doctorInput.partial() }))
    .output(z.any())
    .handler(async ({ context, input }) => {
      const db = getDb(context)
      const [row] = await db
        .update(schema.referringDoctors)
        .set(input.data)
        .where(
          and(
            eq(schema.referringDoctors.id, input.id),
            eq(schema.referringDoctors.organizationId, context.organization.id),
          ),
        )
        .returning()
      if (!row) throw new ORPCError('NOT_FOUND', { message: 'Doctor not found' })
      return row
    }),

  delete: orgAuthed
    .route({ method: 'DELETE', path: '/lis/doctors/:id', tags: ['LIS'] })
    .input(idInput)
    .output(z.any())
    .handler(async ({ context, input }) => {
      const db = getDb(context)
      await db
        .delete(schema.referringDoctors)
        .where(
          and(
            eq(schema.referringDoctors.id, input.id),
            eq(schema.referringDoctors.organizationId, context.organization.id),
          ),
        )
      return { success: true }
    }),
}

/* ------------------------------------------------------------------ */
/* Test catalog                                                        */
/* ------------------------------------------------------------------ */

const analyteInput = z.object({
  name: z.string().min(1).max(120),
  unit: z.string().max(40).optional(),
  refLow: z.number().optional(),
  refHigh: z.number().optional(),
  refText: z.string().max(200).optional(),
  method: z.string().max(120).optional(),
  sortOrder: z.number().int().optional(),
})

const testInput = z.object({
  code: z.string().min(1).max(40),
  name: z.string().min(1).max(200),
  category: z.string().max(80).optional(),
  sampleType: z.string().max(80).optional(),
  labType: z.enum(['human', 'veterinary', 'both']).optional().default('both'),
  price: z.number().optional().default(0),
  tatHours: z.number().int().optional(),
  method: z.string().max(120).optional(),
  active: z.boolean().optional(),
  analytes: z.array(analyteInput).optional(),
})

export const testsRouter = {
  list: orgAuthed
    .route({ method: 'GET', path: '/lis/tests', tags: ['LIS'] })
    .input(listInput)
    .output(z.any())
    .handler(async ({ context, input }) => {
      const db = getDb(context)
      const conditions = [
        eq(schema.testCatalog.organizationId, context.organization.id),
      ]
      if (input.search) {
        conditions.push(
          sql`(${schema.testCatalog.name} ILIKE ${'%' + input.search + '%'} OR ${schema.testCatalog.code} ILIKE ${'%' + input.search + '%'})`,
        )
      }
      // Test catalog changes rarely; cache per org + query for 5 minutes.
      const cacheKey = `lis:tests:${context.organization.id}:${JSON.stringify(input)}`
      return getOrCache(cacheKey, async () => {
        const rows = await db
          .select()
          .from(schema.testCatalog)
          .where(and(...conditions))
          .orderBy(schema.testCatalog.name)
          .limit(input.limit)
          .offset(input.offset)
        return { tests: rows }
      }, 300)
    }),

  get: orgAuthed
    .route({ method: 'GET', path: '/lis/tests/:id', tags: ['LIS'] })
    .input(idInput)
    .output(z.any())
    .handler(async ({ context, input }) => {
      const db = getDb(context)
      const [test] = await db
        .select()
        .from(schema.testCatalog)
        .where(
          and(
            eq(schema.testCatalog.id, input.id),
            eq(schema.testCatalog.organizationId, context.organization.id),
          ),
        )
        .limit(1)
      if (!test) throw new ORPCError('NOT_FOUND', { message: 'Test not found' })
      const analytes = await db
        .select()
        .from(schema.testAnalytes)
        .where(eq(schema.testAnalytes.testId, test.id))
        .orderBy(schema.testAnalytes.sortOrder)
      return { ...test, analytes }
    }),

  create: orgAuthed
    .route({ method: 'POST', path: '/lis/tests', tags: ['LIS'] })
    .input(testInput)
    .output(z.any())
    .handler(async ({ context, input }) => {
      const db = getDb(context)
      const { analytes, ...testData } = input
      const [test] = await db
        .insert(schema.testCatalog)
        .values({ organizationId: context.organization.id, ...testData } as any)
        .returning()
      if (analytes?.length) {
        await db
          .insert(schema.testAnalytes)
          .values(analytes.map((a) => ({ ...a, testId: test.id })) as any)
      }
      return test
    }),

  update: orgAuthed
    .route({ method: 'PATCH', path: '/lis/tests/:id', tags: ['LIS'] })
    .input(z.object({ id: z.string().uuid(), data: testInput.partial() }))
    .output(z.any())
    .handler(async ({ context, input }) => {
      const db = getDb(context)
      const { analytes, ...testData } = input.data
      const [test] = await db
        .update(schema.testCatalog)
        .set({ ...testData, updatedAt: new Date() })
        .where(
          and(
            eq(schema.testCatalog.id, input.id),
            eq(schema.testCatalog.organizationId, context.organization.id),
          ),
        )
        .returning()
      if (!test) throw new ORPCError('NOT_FOUND', { message: 'Test not found' })
      if (analytes) {
        await db
          .delete(schema.testAnalytes)
          .where(eq(schema.testAnalytes.testId, test.id))
        if (analytes.length) {
          await db
            .insert(schema.testAnalytes)
            .values(analytes.map((a) => ({ ...a, testId: test.id })) as any)
        }
      }
      return test
    }),

  delete: orgAuthed
    .route({ method: 'DELETE', path: '/lis/tests/:id', tags: ['LIS'] })
    .input(idInput)
    .output(z.any())
    .handler(async ({ context, input }) => {
      const db = getDb(context)
      await db
        .delete(schema.testCatalog)
        .where(
          and(
            eq(schema.testCatalog.id, input.id),
            eq(schema.testCatalog.organizationId, context.organization.id),
          ),
        )
      return { success: true }
    }),
}

/* ------------------------------------------------------------------ */
/* Orders                                                              */
/* ------------------------------------------------------------------ */

const orderInput = z.object({
  patientId: z.string().uuid(),
  doctorId: z.string().uuid().optional(),
  priority: z.enum(['routine', 'urgent', 'stat']).optional().default('routine'),
  clinicalNotes: z.string().optional(),
  testIds: z.array(z.string().uuid()).min(1),
})

export const ordersRouter = {
  list: orgAuthed
    .route({ method: 'GET', path: '/lis/orders', tags: ['LIS'] })
    .input(
      z
        .object({
          status: z.string().optional(),
          search: z.string().optional(),
          limit: z.coerce.number().int().min(1).max(200).optional().default(50),
          offset: z.coerce.number().int().min(0).optional().default(0),
        })
        .default({}),
    )
    .output(z.any())
    .handler(async ({ context, input }) => {
      const db = getDb(context)
      const conditions = [eq(schema.orders.organizationId, context.organization.id)]
      if (input.status) conditions.push(eq(schema.orders.status, input.status))
      if (input.search) {
        conditions.push(ilike(schema.orders.orderNumber, `%${input.search}%`))
      }
      const rows = await db
        .select({
          order: schema.orders,
          patient: schema.patients,
        })
        .from(schema.orders)
        .leftJoin(schema.patients, eq(schema.orders.patientId, schema.patients.id))
        .where(and(...conditions))
        .orderBy(desc(schema.orders.orderedAt))
        .limit(input.limit)
        .offset(input.offset)
      const [total] = await db
        .select({ count: count() })
        .from(schema.orders)
        .where(and(...conditions))
      return { orders: rows, total: total?.count ?? 0 }
    }),

  get: orgAuthed
    .route({ method: 'GET', path: '/lis/orders/:id', tags: ['LIS'] })
    .input(idInput)
    .output(z.any())
    .handler(async ({ context, input }) => {
      const db = getDb(context)
      const [order] = await db
        .select()
        .from(schema.orders)
        .where(
          and(
            eq(schema.orders.id, input.id),
            eq(schema.orders.organizationId, context.organization.id),
          ),
        )
        .limit(1)
      if (!order) throw new ORPCError('NOT_FOUND', { message: 'Order not found' })
      const items = await db
        .select({ item: schema.orderItems, test: schema.testCatalog })
        .from(schema.orderItems)
        .leftJoin(schema.testCatalog, eq(schema.orderItems.testId, schema.testCatalog.id))
        .where(eq(schema.orderItems.orderId, order.id))
      const sampleRows = await db
        .select()
        .from(schema.samples)
        .where(eq(schema.samples.orderId, order.id))
      return { ...order, items, samples: sampleRows }
    }),

  create: orgAuthed
    .route({ method: 'POST', path: '/lis/orders', tags: ['LIS'] })
    .input(orderInput)
    .output(z.any())
    .handler(async ({ context, input }) => {
      const db = getDb(context)
      const orgId = context.organization.id
      const [{ n }] = await db
        .select({ n: count() })
        .from(schema.orders)
        .where(eq(schema.orders.organizationId, orgId))
      const orderNumber = `ORD-${new Date().getFullYear()}-${String((n ?? 0) + 1).padStart(5, '0')}`

      const [order] = await db
        .insert(schema.orders)
        .values({
          organizationId: orgId,
          orderNumber,
          patientId: input.patientId,
          doctorId: input.doctorId,
          priority: input.priority,
          clinicalNotes: input.clinicalNotes,
          createdBy: context.user.id,
        })
        .returning()

      const tests = await db
        .select()
        .from(schema.testCatalog)
        .where(
          and(
            eq(schema.testCatalog.organizationId, orgId),
            sql`${schema.testCatalog.id} = ANY(${sql.raw(`ARRAY['${input.testIds.join("','")}']::uuid[]`)})`,
          ),
        )

      if (tests.length) {
        await db.insert(schema.orderItems).values(
          tests.map((t) => ({
            orderId: order.id,
            testId: t.id,
            price: t.price,
          })),
        )
      }

      return order
    }),

  updateStatus: orgAuthed
    .route({ method: 'PATCH', path: '/lis/orders/:id/status', tags: ['LIS'] })
    .input(
      z.object({
        id: z.string().uuid(),
        status: z.enum([
          'ordered',
          'collected',
          'received',
          'in_progress',
          'resulted',
          'verified',
          'reported',
          'cancelled',
        ]),
      }),
    )
    .output(z.any())
    .handler(async ({ context, input }) => {
      const db = getDb(context)
      const [row] = await db
        .update(schema.orders)
        .set({ status: input.status, updatedAt: new Date() })
        .where(
          and(
            eq(schema.orders.id, input.id),
            eq(schema.orders.organizationId, context.organization.id),
          ),
        )
        .returning()
      if (!row) throw new ORPCError('NOT_FOUND', { message: 'Order not found' })
      return row
    }),
}

/* ------------------------------------------------------------------ */
/* Samples                                                             */
/* ------------------------------------------------------------------ */

export const samplesRouter = {
  list: orgAuthed
    .route({ method: 'GET', path: '/lis/samples', tags: ['LIS'] })
    .input(
      z
        .object({
          status: z.string().optional(),
          limit: z.coerce.number().int().min(1).max(200).optional().default(50),
          offset: z.coerce.number().int().min(0).optional().default(0),
        })
        .default({}),
    )
    .output(z.any())
    .handler(async ({ context, input }) => {
      const db = getDb(context)
      const conditions = [eq(schema.samples.organizationId, context.organization.id)]
      if (input.status) conditions.push(eq(schema.samples.status, input.status))
      const rows = await db
        .select()
        .from(schema.samples)
        .where(and(...conditions))
        .orderBy(desc(schema.samples.createdAt))
        .limit(input.limit)
        .offset(input.offset)
      return { samples: rows }
    }),

  create: orgAuthed
    .route({ method: 'POST', path: '/lis/samples', tags: ['LIS'] })
    .input(
      z.object({
        orderId: z.string().uuid(),
        sampleType: z.string().min(1).max(80),
        container: z.string().max(80).optional(),
        collectedAt: z.string().optional(),
        barcode: z.string().max(120).optional(),
      }),
    )
    .output(z.any())
    .handler(async ({ context, input }) => {
      const db = getDb(context)
      const orgId = context.organization.id
      const [{ n }] = await db
        .select({ n: count() })
        .from(schema.samples)
        .where(eq(schema.samples.organizationId, orgId))
      const accession = `ACC-${new Date().getFullYear()}-${String((n ?? 0) + 1).padStart(5, '0')}`
      const [row] = await db
        .insert(schema.samples)
        .values({
          organizationId: orgId,
          accession,
          orderId: input.orderId,
          sampleType: input.sampleType,
          container: input.container,
          collectedAt: input.collectedAt ? new Date(input.collectedAt) : new Date(),
          receivedAt: new Date(),
          barcode: input.barcode,
        })
        .returning()
      return row
    }),

  updateStatus: orgAuthed
    .route({ method: 'PATCH', path: '/lis/samples/:id/status', tags: ['LIS'] })
    .input(
      z.object({
        id: z.string().uuid(),
        status: z.enum(['collected', 'received', 'rejected', 'in_progress', 'completed']),
        rejectionReason: z.string().optional(),
      }),
    )
    .output(z.any())
    .handler(async ({ context, input }) => {
      const db = getDb(context)
      const [row] = await db
        .update(schema.samples)
        .set({ status: input.status, rejectionReason: input.rejectionReason })
        .where(
          and(
            eq(schema.samples.id, input.id),
            eq(schema.samples.organizationId, context.organization.id),
          ),
        )
        .returning()
      if (!row) throw new ORPCError('NOT_FOUND', { message: 'Sample not found' })
      return row
    }),
}

/* ------------------------------------------------------------------ */
/* Results                                                             */
/* ------------------------------------------------------------------ */

export const resultsRouter = {
  listBySample: orgAuthed
    .route({ method: 'GET', path: '/lis/results/sample/:sampleId', tags: ['LIS'] })
    .input(z.object({ sampleId: z.string().uuid() }))
    .output(z.any())
    .handler(async ({ context, input }) => {
      const db = getDb(context)
      const rows = await db
        .select({
          result: schema.results,
          analyte: schema.testAnalytes,
          item: schema.orderItems,
          test: schema.testCatalog,
        })
        .from(schema.results)
        .leftJoin(schema.testAnalytes, eq(schema.results.analyteId, schema.testAnalytes.id))
        .leftJoin(schema.orderItems, eq(schema.results.orderItemId, schema.orderItems.id))
        .leftJoin(schema.testCatalog, eq(schema.orderItems.testId, schema.testCatalog.id))
        .where(eq(schema.results.sampleId, input.sampleId))
      return { results: rows }
    }),

  upsert: orgAuthed
    .route({ method: 'POST', path: '/lis/results', tags: ['LIS'] })
    .input(
      z.object({
        sampleId: z.string().uuid(),
        orderItemId: z.string().uuid(),
        analyteId: z.string().uuid().optional(),
        value: z.string().max(200).optional(),
        numericValue: z.number().optional(),
        unit: z.string().max(40).optional(),
        refLow: z.number().optional(),
        refHigh: z.number().optional(),
        comment: z.string().optional(),
      }),
    )
    .output(z.any())
    .handler(async ({ context, input }) => {
      const db = getDb(context)
      let flag: string | null = null
      if (input.numericValue != null) {
        if (input.refLow != null && input.numericValue < input.refLow) flag = 'low'
        else if (input.refHigh != null && input.numericValue > input.refHigh) flag = 'high'
        else flag = 'normal'
      }
      const [row] = await db
        .insert(schema.results)
        .values({
          sampleId: input.sampleId,
          orderItemId: input.orderItemId,
          analyteId: input.analyteId,
          value: input.value,
          numericValue: input.numericValue,
          unit: input.unit,
          refLow: input.refLow,
          refHigh: input.refHigh,
          comment: input.comment,
          flag,
          status: 'entered',
          enteredBy: context.user.id,
          enteredAt: new Date(),
        })
        .returning()
      return row
    }),

  verify: orgAuthed
    .route({ method: 'PATCH', path: '/lis/results/:id/verify', tags: ['LIS'] })
    .input(idInput)
    .output(z.any())
    .handler(async ({ context, input }) => {
      const db = getDb(context)
      const [row] = await db
        .update(schema.results)
        .set({
          status: 'verified',
          verifiedBy: context.user.id,
          verifiedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(schema.results.id, input.id))
        .returning()
      if (!row) throw new ORPCError('NOT_FOUND', { message: 'Result not found' })
      return row
    }),
}

/* ------------------------------------------------------------------ */
/* Reports                                                             */
/* ------------------------------------------------------------------ */

export const lisReportsRouter = {
  list: orgAuthed
    .route({ method: 'GET', path: '/lis/reports', tags: ['LIS'] })
    .input(listInput)
    .output(z.any())
    .handler(async ({ context, input }) => {
      const db = getDb(context)
      const rows = await db
        .select()
        .from(schema.reports)
        .where(eq(schema.reports.organizationId, context.organization.id))
        .orderBy(desc(schema.reports.createdAt))
        .limit(input.limit)
        .offset(input.offset)
      return { reports: rows }
    }),

  create: orgAuthed
    .route({ method: 'POST', path: '/lis/reports', tags: ['LIS'] })
    .input(z.object({ orderId: z.string().uuid(), remarks: z.string().optional() }))
    .output(z.any())
    .handler(async ({ context, input }) => {
      const db = getDb(context)
      const orgId = context.organization.id
      const [{ n }] = await db
        .select({ n: count() })
        .from(schema.reports)
        .where(eq(schema.reports.organizationId, orgId))
      const reportNumber = `RPT-${new Date().getFullYear()}-${String((n ?? 0) + 1).padStart(5, '0')}`
      const [row] = await db
        .insert(schema.reports)
        .values({
          organizationId: orgId,
          orderId: input.orderId,
          reportNumber,
          status: 'final',
          generatedAt: new Date(),
          remarks: input.remarks,
        })
        .returning()
      return row
    }),

  updateStatus: orgAuthed
    .route({ method: 'PATCH', path: '/lis/reports/:id/status', tags: ['LIS'] })
    .input(
      z.object({
        id: z.string().uuid(),
        status: z.enum(['draft', 'final', 'amended', 'delivered']),
        deliveryChannel: z.string().optional(),
      }),
    )
    .output(z.any())
    .handler(async ({ context, input }) => {
      const db = getDb(context)
      const [row] = await db
        .update(schema.reports)
        .set({
          status: input.status,
          deliveryChannel: input.deliveryChannel,
          deliveredAt: input.status === 'delivered' ? new Date() : undefined,
        })
        .where(
          and(
            eq(schema.reports.id, input.id),
            eq(schema.reports.organizationId, context.organization.id),
          ),
        )
        .returning()
      if (!row) throw new ORPCError('NOT_FOUND', { message: 'Report not found' })
      return row
    }),
}

/* ------------------------------------------------------------------ */
/* Billing                                                             */
/* ------------------------------------------------------------------ */

export const lisBillingRouter = {
  listInvoices: orgAuthed
    .route({ method: 'GET', path: '/lis/invoices', tags: ['LIS'] })
    .input(listInput)
    .output(z.any())
    .handler(async ({ context, input }) => {
      const db = getDb(context)
      const rows = await db
        .select()
        .from(schema.invoices)
        .where(eq(schema.invoices.organizationId, context.organization.id))
        .orderBy(desc(schema.invoices.createdAt))
        .limit(input.limit)
        .offset(input.offset)
      return { invoices: rows }
    }),

  createInvoice: orgAuthed
    .route({ method: 'POST', path: '/lis/invoices', tags: ['LIS'] })
    .input(
      z.object({
        orderId: z.string().uuid().optional(),
        subtotal: z.number(),
        discount: z.number().optional().default(0),
        taxPercent: z.number().optional().default(0),
        notes: z.string().optional(),
      }),
    )
    .output(z.any())
    .handler(async ({ context, input }) => {
      const db = getDb(context)
      const orgId = context.organization.id
      const [{ n }] = await db
        .select({ n: count() })
        .from(schema.invoices)
        .where(eq(schema.invoices.organizationId, orgId))
      const invoiceNumber = `INV-${new Date().getFullYear()}-${String((n ?? 0) + 1).padStart(5, '0')}`
      const taxable = input.subtotal - input.discount
      const taxAmount = (taxable * input.taxPercent) / 100
      const total = taxable + taxAmount
      const [row] = await db
        .insert(schema.invoices)
        .values({
          organizationId: orgId,
          orderId: input.orderId,
          invoiceNumber,
          subtotal: input.subtotal,
          discount: input.discount,
          taxPercent: input.taxPercent,
          taxAmount,
          total,
          notes: input.notes,
        })
        .returning()
      return row
    }),

  addPayment: orgAuthed
    .route({ method: 'POST', path: '/lis/invoices/:id/payments', tags: ['LIS'] })
    .input(
      z.object({
        id: z.string().uuid(),
        amount: z.number().positive(),
        method: z.enum(['cash', 'card', 'upi', 'bank', 'insurance', 'other']),
        reference: z.string().max(120).optional(),
      }),
    )
    .output(z.any())
    .handler(async ({ context, input }) => {
      const db = getDb(context)
      const [invoice] = await db
        .select()
        .from(schema.invoices)
        .where(
          and(
            eq(schema.invoices.id, input.id),
            eq(schema.invoices.organizationId, context.organization.id),
          ),
        )
        .limit(1)
      if (!invoice) throw new ORPCError('NOT_FOUND', { message: 'Invoice not found' })
      const [payment] = await db
        .insert(schema.payments)
        .values({
          invoiceId: invoice.id,
          amount: input.amount,
          method: input.method,
          reference: input.reference,
          receivedBy: context.user.id,
        })
        .returning()
      const amountPaid = (invoice.amountPaid ?? 0) + input.amount
      const status =
        amountPaid >= invoice.total ? 'paid' : amountPaid > 0 ? 'partial' : 'unpaid'
      await db
        .update(schema.invoices)
        .set({
          amountPaid,
          status,
          paidAt: status === 'paid' ? new Date() : undefined,
        })
        .where(eq(schema.invoices.id, invoice.id))
      return payment
    }),
}

/* ------------------------------------------------------------------ */
/* Inventory                                                           */
/* ------------------------------------------------------------------ */

export const inventoryRouter = {
  list: orgAuthed
    .route({ method: 'GET', path: '/lis/inventory', tags: ['LIS'] })
    .input(listInput)
    .output(z.any())
    .handler(async ({ context, input }) => {
      const db = getDb(context)
      const conditions = [
        eq(schema.inventoryItems.organizationId, context.organization.id),
      ]
      if (input.search) {
        conditions.push(ilike(schema.inventoryItems.name, `%${input.search}%`))
      }
      const rows = await db
        .select()
        .from(schema.inventoryItems)
        .where(and(...conditions))
        .orderBy(schema.inventoryItems.name)
        .limit(input.limit)
        .offset(input.offset)
      return { items: rows }
    }),

  create: orgAuthed
    .route({ method: 'POST', path: '/lis/inventory', tags: ['LIS'] })
    .input(
      z.object({
        name: z.string().min(1).max(200),
        category: z.enum(['reagent', 'consumable', 'control', 'calibrator', 'other']).optional(),
        unit: z.string().max(40).optional(),
        quantity: z.number().optional().default(0),
        reorderLevel: z.number().optional().default(0),
        lotNumber: z.string().max(80).optional(),
        expiryDate: z.string().optional(),
        supplier: z.string().max(200).optional(),
        unitCost: z.number().optional(),
      }),
    )
    .output(z.any())
    .handler(async ({ context, input }) => {
      const db = getDb(context)
      const [row] = await db
        .insert(schema.inventoryItems)
        .values({ organizationId: context.organization.id, ...input } as any)
        .returning()
      return row
    }),

  transaction: orgAuthed
    .route({ method: 'POST', path: '/lis/inventory/:id/transactions', tags: ['LIS'] })
    .input(
      z.object({
        id: z.string().uuid(),
        type: z.enum(['in', 'out', 'adjust', 'discard']),
        quantity: z.number(),
        reference: z.string().max(120).optional(),
        notes: z.string().optional(),
      }),
    )
    .output(z.any())
    .handler(async ({ context, input }) => {
      const db = getDb(context)
      const [item] = await db
        .select()
        .from(schema.inventoryItems)
        .where(
          and(
            eq(schema.inventoryItems.id, input.id),
            eq(schema.inventoryItems.organizationId, context.organization.id),
          ),
        )
        .limit(1)
      if (!item) throw new ORPCError('NOT_FOUND', { message: 'Item not found' })
      const delta =
        input.type === 'in'
          ? input.quantity
          : input.type === 'adjust'
            ? input.quantity - item.quantity
            : -input.quantity
      const [tx] = await db
        .insert(schema.inventoryTransactions)
        .values({
          itemId: item.id,
          type: input.type,
          quantity: input.quantity,
          reference: input.reference,
          notes: input.notes,
          createdBy: context.user.id,
        })
        .returning()
      await db
        .update(schema.inventoryItems)
        .set({ quantity: item.quantity + delta, updatedAt: new Date() })
        .where(eq(schema.inventoryItems.id, item.id))
      return tx
    }),
}

/* ------------------------------------------------------------------ */
/* Quality control                                                     */
/* ------------------------------------------------------------------ */

export const qcRouter = {
  list: orgAuthed
    .route({ method: 'GET', path: '/lis/qc', tags: ['LIS'] })
    .input(listInput)
    .output(z.any())
    .handler(async ({ context, input }) => {
      const db = getDb(context)
      const rows = await db
        .select({ run: schema.qcRuns, test: schema.testCatalog })
        .from(schema.qcRuns)
        .leftJoin(schema.testCatalog, eq(schema.qcRuns.testId, schema.testCatalog.id))
        .where(eq(schema.qcRuns.organizationId, context.organization.id))
        .orderBy(desc(schema.qcRuns.runDate))
        .limit(input.limit)
        .offset(input.offset)
      return { runs: rows }
    }),

  create: orgAuthed
    .route({ method: 'POST', path: '/lis/qc', tags: ['LIS'] })
    .input(
      z.object({
        testId: z.string().uuid(),
        level: z.enum(['normal', 'abnormal', 'low', 'high']).optional(),
        lotNumber: z.string().max(80).optional(),
        runDate: z.string(),
        status: z.enum(['pass', 'fail', 'warning']).optional(),
        notes: z.string().optional(),
        results: z
          .array(
            z.object({
              analyteId: z.string().uuid().optional(),
              value: z.number(),
              mean: z.number().optional(),
              sd: z.number().optional(),
              cv: z.number().optional(),
              flag: z.enum(['in_control', 'out_of_control']).optional(),
            }),
          )
          .optional(),
      }),
    )
    .output(z.any())
    .handler(async ({ context, input }) => {
      const db = getDb(context)
      const { results, ...runData } = input
      const [run] = await db
        .insert(schema.qcRuns)
        .values({
          organizationId: context.organization.id,
          createdBy: context.user.id,
          ...runData,
        } as any)
        .returning()
      if (results?.length) {
        await db
          .insert(schema.qcResults)
          .values(results.map((r) => ({ ...r, runId: run.id })) as any)
      }
      return run
    }),
}

/* ------------------------------------------------------------------ */
/* Aggregate router                                                    */
/* ------------------------------------------------------------------ */

export const lisRouter = {
  patients: patientsRouter,
  doctors: doctorsRouter,
  tests: testsRouter,
  orders: ordersRouter,
  samples: samplesRouter,
  results: resultsRouter,
  reports: lisReportsRouter,
  billing: lisBillingRouter,
  inventory: inventoryRouter,
  qc: qcRouter,
}
