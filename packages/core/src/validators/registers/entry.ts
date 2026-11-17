/**
 * Entry Register Validation Schemas
 * Zod schemas for validating entry register requests
 */

import { z } from 'zod'

// Create entry register schema
export const createEntryRegisterSchema = z.object({
  invoice: z.string().max(100).optional(),
  receivingDate: z.string().date(),
  nameOfArticle: z.string().min(1, 'Article name is required').max(255),
  packSize: z.string().max(100).optional(),
  quantity: z.coerce.number().positive('Quantity must be positive'),
  rate: z.coerce.number().nonnegative().optional(),
  gstPercent: z.coerce.number().min(0).max(100).optional(),
  rateWithGst: z.coerce.number().nonnegative().optional(),
  totalWithGst: z.coerce.number().nonnegative().optional(),
  source: z.string().max(255).optional(),
})

// Update entry register schema (all fields optional)
export const updateEntryRegisterSchema = createEntryRegisterSchema.partial()

// Filter schema for list queries
export const entryRegisterFilterSchema = z.object({
  invoice: z.string().optional(),
  receivingDateFrom: z.string().date().optional(),
  receivingDateTo: z.string().date().optional(),
  nameOfArticle: z.string().optional(),
  source: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(100),
  offset: z.coerce.number().int().min(0).optional().default(0),
})
