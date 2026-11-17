/**
 * PSKS Cashbook Register Validation Schemas
 */

import { z } from 'zod'

export const createPsksCashbookRegisterSchema = z.object({
  date: z.string().date(),
  particulars: z.string().optional(),
  oB: z.string().max(50).optional(),
  dateExpenditure: z.string().date().optional(),
  particularsExpenditure: z.string().optional(),
  expenditure: z.coerce.number().nonnegative().optional(),
  debitedAmount: z.coerce.number().nonnegative().optional(),
  cB: z.string().max(50).optional(),
})

export const updatePsksCashbookRegisterSchema =
  createPsksCashbookRegisterSchema.partial()

export const psksCashbookRegisterFilterSchema = z.object({
  dateFrom: z.string().date().optional(),
  dateTo: z.string().date().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(100),
  offset: z.coerce.number().int().min(0).optional().default(0),
})
