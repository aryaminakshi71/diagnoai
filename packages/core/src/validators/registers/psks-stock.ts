/**
 * PSKS Stock Register Validation Schemas
 */

import { z } from 'zod'

export const createPsksStockRegisterSchema = z.object({
  srNo: z.coerce.number().int().optional(),
  particulars: z.string().optional(),
  pageNo: z.string().max(50).optional(),
  date: z.string().date().optional(),
  oB: z.string().max(50).optional(),
  dateSource: z.string().date().optional(),
  source: z.string().max(255).optional(),
  quantity: z.coerce.number().nonnegative().optional(),
  tQuantity: z.coerce.number().nonnegative().optional(),
  cM: z.string().max(50).optional(),
})

export const updatePsksStockRegisterSchema =
  createPsksStockRegisterSchema.partial()

export const psksStockRegisterFilterSchema = z.object({
  srNo: z.coerce.number().int().optional(),
  particulars: z.string().optional(),
  dateFrom: z.string().date().optional(),
  dateTo: z.string().date().optional(),
  source: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(100),
  offset: z.coerce.number().int().min(0).optional().default(0),
})
