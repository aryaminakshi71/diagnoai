/**
 * Biochemistry Register Validation Schemas
 * Zod schemas for validating biochemistry register requests
 */

import { z } from 'zod'

// Create biochemistry register schema
export const createBiochemistryRegisterSchema = z.object({
  date: z.string().date(),
  yearlyNo: z.string().max(50).optional(),
  monthlyNo: z.string().max(50).optional(),
  dailyNo: z.string().max(50).optional(),
  ownerName: z.string().max(255).optional(),
  village: z.string().max(255).optional(),
  species: z.string().max(100).optional(),
  age: z.string().max(50).optional(),
  sex: z.enum(['M', 'F']).optional(),
  altUL: z.coerce.number().nonnegative().optional(),
  ureaMgDl: z.coerce.number().nonnegative().optional(),
  glucoseMgDl: z.coerce.number().nonnegative().optional(),
  opdRegisterId: z.string().uuid().optional(),
})

// Batch create schema
export const batchCreateBiochemistrySchema = z.object({
  records: z.array(createBiochemistryRegisterSchema).min(1).max(100),
})

// Update biochemistry register schema
export const updateBiochemistryRegisterSchema =
  createBiochemistryRegisterSchema.partial()

// Filter schema for list queries
export const biochemistryRegisterFilterSchema = z.object({
  dateFrom: z.string().date().optional(),
  dateTo: z.string().date().optional(),
  yearlyNo: z.string().optional(),
  monthlyNo: z.string().optional(),
  dailyNo: z.string().optional(),
  ownerName: z.string().optional(),
  village: z.string().optional(),
  species: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(100),
  offset: z.coerce.number().int().min(0).optional().default(0),
})
