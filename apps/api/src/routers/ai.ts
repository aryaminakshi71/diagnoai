/**
 * AI Router
 *
 * Exposes AI-powered lab features.
 */

import { z } from 'zod'
import { orgAuthed } from '../procedures'
import {
  explainAbnormal,
  interpretResults,
  summarizeReport,
  type LabTest,
} from '../lib/ai-features'

const testSchema = z.object({
  name: z.string(),
  result: z.string(),
  unit: z.string().optional(),
  referenceRange: z.string().optional(),
  flag: z.enum(['normal', 'high', 'low']).optional(),
})

export const aiRouter = {
  interpret: orgAuthed
    .route({
      method: 'POST',
      path: '/ai/interpret',
      summary: 'AI interpretation of lab results',
      tags: ['AI'],
    })
    .input(z.object({ tests: z.array(testSchema) }))
    .output(z.any())
    .handler(async ({ input }) => {
      const result = await interpretResults(input.tests as LabTest[])
      return { result }
    }),

  explain: orgAuthed
    .route({
      method: 'POST',
      path: '/ai/explain',
      summary: 'Explain an abnormal result',
      tags: ['AI'],
    })
    .input(testSchema)
    .output(z.any())
    .handler(async ({ input }) => {
      const result = await explainAbnormal(input as LabTest)
      return { result }
    }),

  summarize: orgAuthed
    .route({
      method: 'POST',
      path: '/ai/summarize',
      summary: 'Patient-friendly report summary',
      tags: ['AI'],
    })
    .input(
      z.object({
        labType: z.enum(['human', 'veterinary']).default('human'),
        tests: z.array(testSchema),
      }),
    )
    .output(z.any())
    .handler(async ({ input }) => {
      const result = await summarizeReport({
        labType: input.labType ?? 'human',
        tests: input.tests as LabTest[],
      })
      return { result }
    }),
}
