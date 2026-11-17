/**
 * Starter test catalog
 *
 * Inserted once when a new organization is created so the lab can
 * take orders immediately. Covers common human + veterinary panels.
 */

import { eq } from 'drizzle-orm'
import { db, schema } from '@diagnoai/storage/db'

const STARTER_TESTS: Array<{
  code: string
  name: string
  category: string
  sampleType: string
  price: number
  labType: 'human' | 'veterinary' | 'both'
  analytes: Array<{
    name: string
    unit?: string
    refLow?: number
    refHigh?: number
    refText?: string
  }>
}> = [
  {
    code: 'CBC',
    name: 'Complete Blood Count',
    category: 'Haematology',
    sampleType: 'Blood',
    price: 350,
    labType: 'both',
    analytes: [
      { name: 'Haemoglobin', unit: 'g/dL', refLow: 12, refHigh: 16 },
      { name: 'WBC', unit: '10^3/µL', refLow: 4, refHigh: 11 },
      { name: 'Platelets', unit: '10^3/µL', refLow: 150, refHigh: 450 },
      { name: 'RBC', unit: '10^6/µL', refLow: 4.2, refHigh: 5.9 },
      { name: 'Haematocrit', unit: '%', refLow: 36, refHigh: 50 },
    ],
  },
  {
    code: 'LFT',
    name: 'Liver Function Test',
    category: 'Biochemistry',
    sampleType: 'Serum',
    price: 600,
    labType: 'both',
    analytes: [
      { name: 'ALT', unit: 'U/L', refLow: 7, refHigh: 56 },
      { name: 'AST', unit: 'U/L', refLow: 10, refHigh: 40 },
      { name: 'ALP', unit: 'U/L', refLow: 44, refHigh: 147 },
      { name: 'Bilirubin Total', unit: 'mg/dL', refLow: 0.1, refHigh: 1.2 },
      { name: 'Albumin', unit: 'g/dL', refLow: 3.5, refHigh: 5.0 },
    ],
  },
  {
    code: 'KFT',
    name: 'Kidney Function Test',
    category: 'Biochemistry',
    sampleType: 'Serum',
    price: 600,
    labType: 'both',
    analytes: [
      { name: 'Urea', unit: 'mg/dL', refLow: 15, refHigh: 40 },
      { name: 'Creatinine', unit: 'mg/dL', refLow: 0.7, refHigh: 1.3 },
      { name: 'Uric Acid', unit: 'mg/dL', refLow: 3.5, refHigh: 7.2 },
      { name: 'Sodium', unit: 'mmol/L', refLow: 135, refHigh: 145 },
      { name: 'Potassium', unit: 'mmol/L', refLow: 3.5, refHigh: 5.1 },
    ],
  },
  {
    code: 'LIPID',
    name: 'Lipid Profile',
    category: 'Biochemistry',
    sampleType: 'Serum',
    price: 500,
    labType: 'human',
    analytes: [
      { name: 'Total Cholesterol', unit: 'mg/dL', refLow: 0, refHigh: 200 },
      { name: 'HDL', unit: 'mg/dL', refLow: 40, refHigh: 60 },
      { name: 'LDL', unit: 'mg/dL', refLow: 0, refHigh: 100 },
      { name: 'Triglycerides', unit: 'mg/dL', refLow: 0, refHigh: 150 },
    ],
  },
  {
    code: 'TSH',
    name: 'Thyroid Stimulating Hormone',
    category: 'Hormones',
    sampleType: 'Serum',
    price: 300,
    labType: 'both',
    analytes: [
      { name: 'TSH', unit: 'µIU/mL', refLow: 0.4, refHigh: 4.0 },
    ],
  },
  {
    code: 'HBA1C',
    name: 'HbA1c',
    category: 'Biochemistry',
    sampleType: 'Blood',
    price: 450,
    labType: 'human',
    analytes: [
      { name: 'HbA1c', unit: '%', refLow: 4, refHigh: 5.7 },
    ],
  },
  {
    code: 'URINE',
    name: 'Urine Routine',
    category: 'Clinical Pathology',
    sampleType: 'Urine',
    price: 150,
    labType: 'both',
    analytes: [
      { name: 'Protein', refText: 'Negative' },
      { name: 'Glucose', refText: 'Negative' },
      { name: 'Pus Cells', unit: '/hpf', refText: '0-5' },
      { name: 'RBC', unit: '/hpf', refText: '0-2' },
    ],
  },
  {
    code: 'CRP',
    name: 'C-Reactive Protein',
    category: 'Immunology',
    sampleType: 'Serum',
    price: 400,
    labType: 'both',
    analytes: [
      { name: 'CRP', unit: 'mg/L', refLow: 0, refHigh: 5 },
    ],
  },
  {
    code: 'VET-CBC',
    name: 'Veterinary CBC',
    category: 'Veterinary Haematology',
    sampleType: 'Blood',
    price: 400,
    labType: 'veterinary',
    analytes: [
      { name: 'Haemoglobin', unit: 'g/dL', refLow: 8, refHigh: 15 },
      { name: 'WBC', unit: '10^3/µL', refLow: 6, refHigh: 17 },
      { name: 'Platelets', unit: '10^3/µL', refLow: 200, refHigh: 500 },
    ],
  },
  {
    code: 'VET-LFT',
    name: 'Veterinary Liver Panel',
    category: 'Veterinary Biochemistry',
    sampleType: 'Serum',
    price: 650,
    labType: 'veterinary',
    analytes: [
      { name: 'ALT', unit: 'U/L', refLow: 10, refHigh: 100 },
      { name: 'ALP', unit: 'U/L', refLow: 20, refHigh: 200 },
      { name: 'Bilirubin', unit: 'mg/dL', refLow: 0, refHigh: 0.9 },
    ],
  },
]

export async function seedStarterCatalog(organizationId: string) {
  const existing = await db
    .select({ id: schema.testCatalog.id })
    .from(schema.testCatalog)
    .where(eq(schema.testCatalog.organizationId, organizationId))
    .limit(1)
  if (existing.length) return

  for (const test of STARTER_TESTS) {
    const { analytes, ...testData } = test
    const [row] = await db
      .insert(schema.testCatalog)
      .values({ organizationId, ...testData })
      .returning()
    if (analytes.length) {
      await db
        .insert(schema.testAnalytes)
        .values(analytes.map((a, i) => ({ ...a, testId: row.id, sortOrder: i })))
    }
  }
}
