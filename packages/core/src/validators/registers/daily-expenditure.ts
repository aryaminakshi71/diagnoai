/**
 * Daily Expenditure Register Validation Schemas
 */

import { z } from 'zod'

// Daily expenditure entry schema
export const dailyExpenditureEntrySchema = z.object({
  dayNumber: z.coerce.number().int().min(1).max(31),
  amount: z.coerce.number().nonnegative().optional(),
})

export const createDailyExpenditureRegisterSchema = z.object({
  sno: z.coerce.number().int().optional(),
  particulars: z.string().min(1, 'Particulars is required'),
  oB: z.string().max(50).optional(),
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(2000).max(2100),
  entries: z.array(dailyExpenditureEntrySchema).optional(), // Daily entries (1-31)
})

export const updateDailyExpenditureRegisterSchema =
  createDailyExpenditureRegisterSchema.partial()

export const dailyExpenditureRegisterFilterSchema = z.object({
  month: z.coerce.number().int().min(1).max(12).optional(),
  year: z.coerce.number().int().min(2000).max(2100).optional(),
  particulars: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(100),
  offset: z.coerce.number().int().min(0).optional().default(0),
})
