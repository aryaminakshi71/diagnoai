/**
 * Brucella Sero Surveillance Register Validation Schemas
 */

import { z } from 'zod'

export const createBrucellaSeroRegisterSchema = z.object({
  srNo: z.coerce.number().int().optional(),
  ownerName: z.string().max(255).optional(),
  village: z.string().max(255).optional(),
  nameOfGvh: z.string().max(255).optional(),
  species: z.string().max(100).optional(),
  age: z.string().max(50).optional(),
  sex: z.enum(['M', 'F']).optional(),
  tagNo: z.string().max(100).optional(),
  dateOfSampling: z.string().date().optional(),
  dateOfVaccination: z.string().date().optional(),
  testResult: z.string().max(100).optional(),
  remarks: z.string().optional(),
})

export const updateBrucellaSeroRegisterSchema =
  createBrucellaSeroRegisterSchema.partial()

export const brucellaSeroRegisterFilterSchema = z.object({
  srNo: z.coerce.number().int().optional(),
  ownerName: z.string().optional(),
  village: z.string().optional(),
  species: z.string().optional(),
  tagNo: z.string().optional(),
  dateOfSamplingFrom: z.string().date().optional(),
  dateOfSamplingTo: z.string().date().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(100),
  offset: z.coerce.number().int().min(0).optional().default(0),
})
