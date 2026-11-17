/**
 * Brucella RBPT Register Validation Schemas
 */

import { z } from 'zod'

export const createBrucellaRbptRegisterSchema = z.object({
  date: z.string().date(),
  yearlyNo: z.string().max(50).optional(),
  monthlyNo: z.string().max(50).optional(),
  dailyNo: z.string().max(50).optional(),
  name: z.string().max(255).optional(),
  village: z.string().max(255).optional(),
  gvh: z.string().max(255).optional(),
  species: z.string().max(100).optional(),
  age: z.string().max(50).optional(),
  sex: z.enum(['M', 'F']).optional(),
  testResult: z.string().max(100).optional(),
  remarks: z.string().optional(),
})

export const updateBrucellaRbptRegisterSchema =
  createBrucellaRbptRegisterSchema.partial()

export const brucellaRbptRegisterFilterSchema = z.object({
  dateFrom: z.string().date().optional(),
  dateTo: z.string().date().optional(),
  yearlyNo: z.string().optional(),
  name: z.string().optional(),
  species: z.string().optional(),
  testResult: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(100),
  offset: z.coerce.number().int().min(0).optional().default(0),
})

export const batchCreateBrucellaRbptSchema = z.object({
  records: z.array(createBrucellaRbptRegisterSchema).min(1).max(100),
})
