/**
 * Bird Flu Register Validation Schemas
 */

import { z } from 'zod'

export const createBirdFluRegisterSchema = z.object({
  srNo: z.coerce.number().int().optional(),
  location: z.string().max(255).optional(),
  nameAddressTelephoneSender: z.string().optional(),
  villageWardArea: z.string().max(255).optional(),
  totalSamples: z.coerce.number().int().nonnegative().optional(),
  poultryType: z.string().max(255).optional(),
  flexibleData: z.record(z.unknown()).optional(),
})

export const updateBirdFluRegisterSchema = createBirdFluRegisterSchema.partial()

export const birdFluRegisterFilterSchema = z.object({
  srNo: z.coerce.number().int().optional(),
  location: z.string().optional(),
  villageWardArea: z.string().optional(),
  poultryType: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(100),
  offset: z.coerce.number().int().min(0).optional().default(0),
})
