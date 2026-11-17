import { z } from 'zod'

export const noteStatusSchema = z.enum(['active', 'archived'])
