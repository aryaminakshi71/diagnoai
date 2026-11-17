/**
 * PSKS Ledger Register Validation Schemas
 */

import { z } from 'zod'

export const createPsksLedgerRegisterSchema = z.object({
  srNo: z.coerce.number().int().optional(),
  nameOfArticle: z.string().max(255).optional(),
  dateOfSupply: z.string().date().optional(),
  qtyInHands: z.coerce.number().nonnegative().optional(),
  receivingDateDddLab: z.string().date().optional(),
  receivedDate: z.string().date().optional(),
  receivedSource: z.string().max(255).optional(),
  quantity: z.coerce.number().nonnegative().optional(),
  totalQty: z.coerce.number().nonnegative().optional(),
  servicable: z.string().max(50).optional(),
  remarks: z.string().optional(),
})

export const updatePsksLedgerRegisterSchema =
  createPsksLedgerRegisterSchema.partial()

export const psksLedgerRegisterFilterSchema = z.object({
  srNo: z.coerce.number().int().optional(),
  nameOfArticle: z.string().optional(),
  dateOfSupplyFrom: z.string().date().optional(),
  dateOfSupplyTo: z.string().date().optional(),
  receivedSource: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(100),
  offset: z.coerce.number().int().min(0).optional().default(0),
})
