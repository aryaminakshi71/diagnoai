/**
 * AbSt Register Validation Schemas (Antibiotic Sensitivity Testing)
 */

import { z } from 'zod'

const antibioticSensitivitySchema = z.enum(['S', 'R', 'I']) // Sensitive, Resistant, Intermediate

export const antibioticResultsSchema = z.object({
  o: antibioticSensitivitySchema.optional(),
  czx: antibioticSensitivitySchema.optional(),
  ex10: antibioticSensitivitySchema.optional(),
  ctr: antibioticSensitivitySchema.optional(),
  ak: antibioticSensitivitySchema.optional(),
  gen10: antibioticSensitivitySchema.optional(),
  cfs: antibioticSensitivitySchema.optional(),
  ams: antibioticSensitivitySchema.optional(),
})

export const createAbstRegisterSchema = z.object({
  date: z.string().date(),
  yearlyNo: z.string().max(50).optional(),
  monthlyNo: z.string().max(50).optional(),
  dailyNo: z.string().max(50).optional(),
  ownerName: z.string().max(255).optional(),
  address: z.string().optional(),
  species: z.string().max(100).optional(),
  sampleType: z.string().max(100).optional(),
  referredByGvh: z.string().max(255).optional(),
  history: z.string().optional(),
  earlierTreatmentYesNo: z.enum(['Yes', 'No']).optional(),
  sampleCodeOnMedia: z.string().max(100).optional(),
  sampleBroughtIn: z.string().max(100).optional(),
  bacteriaIsolatedNoGrowth: z.string().max(100).optional(),
  antibioticResults: antibioticResultsSchema.optional(),
})

export const updateAbstRegisterSchema = createAbstRegisterSchema.partial()

export const abstRegisterFilterSchema = z.object({
  dateFrom: z.string().date().optional(),
  dateTo: z.string().date().optional(),
  yearlyNo: z.string().optional(),
  ownerName: z.string().optional(),
  species: z.string().optional(),
  sampleType: z.string().optional(),
  bacteriaIsolatedNoGrowth: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(100),
  offset: z.coerce.number().int().min(0).optional().default(0),
})
