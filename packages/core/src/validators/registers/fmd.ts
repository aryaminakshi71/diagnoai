/**
 * FMD Register Validation Schemas
 */

import { z } from 'zod'

export const createFmdRegisterSchema = z.object({
  sampleIdCryovialCode: z.string().max(100).optional(),
  dateOfSampling: z.string().date(),
  ownerName: z.string().max(255).optional(),
  village: z.string().max(255).optional(),
  blockTehsil: z.string().max(255).optional(),
  district: z.string().max(255).optional(),
  pinCode: z.string().max(10).optional(),
  species: z.string().max(100).optional(),
  ageMonths: z.coerce.number().int().nonnegative().optional(),
  sex: z.enum(['M', 'F']).optional(),
  clinicalSigns: z.string().optional(),
  testResult: z.string().max(100).optional(),
  remarks: z.string().optional(),
})

export const updateFmdRegisterSchema = createFmdRegisterSchema.partial()

export const fmdRegisterFilterSchema = z.object({
  sampleIdCryovialCode: z.string().optional(),
  dateOfSamplingFrom: z.string().date().optional(),
  dateOfSamplingTo: z.string().date().optional(),
  ownerName: z.string().optional(),
  district: z.string().optional(),
  species: z.string().optional(),
  testResult: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(100),
  offset: z.coerce.number().int().min(0).optional().default(0),
})
