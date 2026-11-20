/**
 * Branding Router — per-organization white-label settings.
 */
import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { schema } from '@diagnoai/storage/db'
const whiteLabelSettings = schema.whiteLabelSettings
import { orgAuthed, getDb, pub } from '../procedures'


const updateSchema = z.object({
  brandName: z.string().min(1).max(120),
  logoUrl: z.string().url().nullable().optional(),
  primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  supportEmail: z.string().email().nullable().optional(),
  customDomain: z.string().max(180).nullable().optional(),
})

const orgIdOf = (context: any): string =>
  context?.organization?.id ?? context?.user?.organizationId ?? ''

export const brandingRouter = {
  get: orgAuthed
    .route({ method: 'GET', path: '/branding', summary: 'Get white-label branding', tags: ['Branding'] })
    .output(z.any())
    .handler(async ({ context }) => {
      const orgId = orgIdOf(context)
      if (!orgId) return { branding: null }
      const db = getDb(context as any)
      const [row] = await db.select().from(whiteLabelSettings).where(eq(whiteLabelSettings.organizationId, orgId)).limit(1)
      return { branding: row ?? null }
    }),
  getPublic: pub
    .route({ method: "GET", path: "/branding/public", tags: ["Branding"] })
    .output(z.any())
    .handler(async ({ context }) => {
      const db = getDb(context as any);
      const host = ((context as any).headers?.get("host") ?? "").split(":")[0];
      if (host) {
        const [byDomain] = await db
          .select()
          .from(schema.whiteLabelSettings)
          .where(eq(schema.whiteLabelSettings.customDomain, host))
          .limit(1);
        if (byDomain) return { branding: byDomain };
      }
      const [any] = await db.select().from(schema.whiteLabelSettings).limit(1);
      return { branding: any ?? null };
    }),

  update: orgAuthed
    .route({ method: 'PUT', path: '/branding', summary: 'Update white-label branding', tags: ['Branding'] })
    .input(updateSchema)
    .output(z.any())
    .handler(async ({ context, input }) => {
      const orgId = orgIdOf(context)
      if (!orgId) throw new Error('No organization in context')
      const db = getDb(context as any)
      const [existing] = await db.select().from(whiteLabelSettings).where(eq(whiteLabelSettings.organizationId, orgId)).limit(1)
      if (existing) {
        const [row] = await db.update(whiteLabelSettings).set({ ...input, updatedAt: new Date() }).where(eq(whiteLabelSettings.organizationId, orgId)).returning()
        return { branding: row }
      }
      const [row] = await db.insert(whiteLabelSettings).values({ organizationId: orgId, ...input }).returning()
      return { branding: row }
    }),
}
