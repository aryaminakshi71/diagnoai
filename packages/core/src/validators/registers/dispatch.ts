/**
 * Dispatch Register Validation Schemas
 */

import { z } from 'zod'

export const createDispatchRegisterSchema = z.object({
  dNo: z.string().max(100).optional(),
  date: z.string().date(),
  to: z.string().max(255).optional(),
  subject: z.string().optional(),
  remarks: z.string().optional(),
})

export const updateDispatchRegisterSchema =
  createDispatchRegisterSchema.partial()

export const dispatchRegisterFilterSchema = z.object({
  dNo: z.string().optional(),
  dateFrom: z.string().date().optional(),
  dateTo: z.string().date().optional(),
  to: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(100),
  offset: z.coerce.number().int().min(0).optional().default(0),
})
