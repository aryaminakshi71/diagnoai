/**
 * DiagnoLIS AI Features
 *
 * AI-powered lab features:
 * - Result interpretation
 * - Abnormal-result explanation
 * - Patient-friendly report summary
 *
 * PHI guardrail: callers must pass de-identified data (no patient name/ID)
 * to the model. The router strips names before calling these functions.
 */

import { createAIClient } from './ai'

const ai = createAIClient({ provider: 'openai' })

async function chatJSON<T>(system: string, user: string): Promise<T | null> {
  if (!ai || ai.type !== 'openai') return null
  const { default: OpenAI } = await import('openai')
  const openai = new OpenAI({ apiKey: ai.apiKey })
  const res = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
  })
  const content = res.choices[0]?.message?.content
  return content ? (JSON.parse(content) as T) : null
}

export interface LabTest {
  name: string
  result: string
  unit?: string
  referenceRange?: string
  flag?: 'normal' | 'high' | 'low'
}

export async function interpretResults(tests: LabTest[]) {
  const system =
    'You are a clinical laboratory assistant. Interpret these lab results concisely for a doctor. ' +
    'Never give a definitive diagnosis. Return JSON: ' +
    '{"summary": string, "abnormal": [{"test": string, "interpretation": string}], "disclaimer": string}'
  return chatJSON<{
    summary: string
    abnormal: Array<{ test: string; interpretation: string }>
    disclaimer: string
  }>(system, JSON.stringify(tests))
}

export async function explainAbnormal(test: LabTest) {
  const system =
    'You are a clinical laboratory assistant. Explain in 1-2 sentences why this result may be abnormal ' +
    'and what it can indicate. Return JSON: {"explanation": string}'
  return chatJSON<{ explanation: string }>(system, JSON.stringify(test))
}

export async function summarizeReport(input: {
  labType: 'human' | 'veterinary'
  tests: LabTest[]
}) {
  const system =
    'Summarize this lab report in 2-3 plain-language sentences for the patient/owner. ' +
    'Return JSON: {"summary": string}'
  return chatJSON<{ summary: string }>(system, JSON.stringify(input))
}
