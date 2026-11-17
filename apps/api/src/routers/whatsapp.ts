/**
 * WhatsApp Router
 *
 * Sends report links / messages via the WhatsApp Cloud API (Meta).
 * Configure WHATSAPP_TOKEN and WHATSAPP_PHONE_ID to enable.
 */

import { z } from 'zod'
import { orgAuthed } from '../procedures'

const sendSchema = z.object({
  to: z.string().min(10),
  message: z.string().default('Your lab report is ready.'),
  documentUrl: z.string().url().optional(),
  fileName: z.string().optional(),
})

export const whatsappRouter = {
  send: orgAuthed
    .route({
      method: 'POST',
      path: '/whatsapp/send',
      summary: 'Send a WhatsApp message or report document',
      tags: ['WhatsApp'],
    })
    .input(sendSchema)
    .output(
      z.object({
        sent: z.boolean(),
        messageId: z.string().optional(),
        reason: z.string().optional(),
      }),
    )
    .handler(async ({ context, input }) => {
      const token = context.env.WHATSAPP_TOKEN as string | undefined
      const phoneId = context.env.WHATSAPP_PHONE_ID as string | undefined

      if (!token || !phoneId) {
        return {
          sent: false,
          reason:
            'WhatsApp not configured (set WHATSAPP_TOKEN and WHATSAPP_PHONE_ID)',
        }
      }

      const url = `https://graph.facebook.com/v20.0/${phoneId}/messages`
      const body = input.documentUrl
        ? {
            messaging_product: 'whatsapp',
            to: input.to,
            type: 'document',
            document: {
              link: input.documentUrl,
              filename: input.fileName || 'report.pdf',
            },
          }
        : {
            messaging_product: 'whatsapp',
            to: input.to,
            type: 'text',
            text: { body: input.message },
          }

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const err = await res.text()
        return {
          sent: false,
          reason: `WhatsApp API error: ${err.slice(0, 200)}`,
        }
      }

      const data = (await res.json()) as {
        messages?: Array<{ id: string }>
      }
      return { sent: true, messageId: data?.messages?.[0]?.id }
    }),
}
