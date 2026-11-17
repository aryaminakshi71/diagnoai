/**
 * OPD Register Validation Schemas
 * Zod schemas for validating OPD register requests
 */

import { z } from 'zod'

// Create OPD register schema
export const createOpdRegisterSchema = z.object({
  date: z.string().date(),
  yearlyNo: z.string().max(50).optional(),
  monthlyNo: z.string().max(50).optional(),
  dailyNo: z.string().max(50).optional(),
  ownerName: z.string().max(255).optional(),
  address: z.string().optional(),
  species: z.string().max(100).optional(),
  sampleCode: z.string().max(100).optional(),
  testPerformed: z.string().max(255).optional(),
  result: z.string().optional(),
})

// Update OPD register schema
export const updateOpdRegisterSchema = createOpdRegisterSchema.partial()

// Filter schema for list queries
export const opdRegisterFilterSchema = z.object({
  dateFrom: z.string().date().optional(),
  dateTo: z.string().date().optional(),
  yearlyNo: z.string().optional(),
  monthlyNo: z.string().optional(),
  dailyNo: z.string().optional(),
  ownerName: z.string().optional(),
  species: z.string().optional(),
  sampleCode: z.string().optional(),
  testPerformed: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(100),
  offset: z.coerce.number().int().min(0).optional().default(0),
})
