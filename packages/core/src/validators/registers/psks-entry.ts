/**
 * PSKS Entry Register Validation Schemas
 */

import { z } from 'zod'

export const createPsksEntryRegisterSchema = z.object({
  srNo: z.coerce.number().int().optional(),
  dateOfBill: z.string().date(),
  descriptionOfGoodsServices: z.string().optional(),
  quantity: z.coerce.number().nonnegative().optional(),
  hsnCode: z.string().max(50).optional(),
  ratePerItem: z.coerce.number().nonnegative().optional(),
  totalAmount: z.coerce.number().nonnegative().optional(),
  source: z.string().max(255).optional(),
  billInvoiceNo: z.string().max(100).optional(),
  remark: z.string().optional(),
})

export const updatePsksEntryRegisterSchema =
  createPsksEntryRegisterSchema.partial()

export const psksEntryRegisterFilterSchema = z.object({
  srNo: z.coerce.number().int().optional(),
  dateOfBillFrom: z.string().date().optional(),
  dateOfBillTo: z.string().date().optional(),
  billInvoiceNo: z.string().optional(),
  source: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(100),
  offset: z.coerce.number().int().min(0).optional().default(0),
})
