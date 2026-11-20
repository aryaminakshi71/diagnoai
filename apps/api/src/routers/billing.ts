/**
 * Billing Router
 *
 * Billing and subscription management endpoints.
 */

import { z } from "zod";
import { eq } from "drizzle-orm";
import { orgAuthed, pub, getDb, schema } from "../procedures";

const PLANS = [
  { id: "starter", name: "Starter", price: 2999, interval: "month", limits: "1 lab, 3 users, 500 reports/mo" },
  { id: "growth", name: "Growth", price: 6999, interval: "month", limits: "1 lab, 10 users, unlimited reports" },
  { id: "pro", name: "Pro", price: 14999, interval: "month", limits: "Multi-branch, analyzer integration" },
  { id: "enterprise", name: "Enterprise", price: 0, interval: "custom", limits: "Chains, HL7/FHIR, on-prem" },
];

export const billingRouter = {
  getPlans: pub
    .route({
      method: "GET",
      path: "/billing/plans",
      summary: "List billing plans",
      tags: ["Billing"],
    })
    .output(z.any())
    .handler(async () => ({ plans: PLANS })),

  getSubscription: orgAuthed
    .route({
      method: "GET",
      path: "/billing/subscription",
      summary: "Get organization subscription",
      tags: ["Billing"],
    })
    .output(z.any())
    .handler(async ({ context }) => {
      const db = getDb(context);
      const [org] = await db
        .select()
        .from(schema.organizations)
        .where(eq(schema.organizations.id, context.organization.id))
        .limit(1);
      return {
        plan: org?.plan ?? "free",
        status: org?.subscriptionStatus ?? "none",
        expiresAt: org?.subscriptionExpiresAt ?? null,
      };
    }),

  subscribe: orgAuthed
    .route({
      method: "POST",
      path: "/billing/subscribe",
      summary: "Subscribe to a plan",
      tags: ["Billing"],
    })
    .input(
      z.object({
        plan: z.string(),
        interval: z.enum(["month", "year"]).optional(),
      }),
    )
    .output(z.any())
    .handler(async ({ context, input }) => {
      const db = getDb(context);
      const expires = new Date();
      expires.setMonth(expires.getMonth() + (input.interval === "year" ? 12 : 1));
      await db
        .update(schema.organizations)
        .set({
          plan: input.plan,
          subscriptionStatus: "active",
          subscriptionExpiresAt: expires,
        })
        .where(eq(schema.organizations.id, context.organization.id));
      return { ok: true, plan: input.plan, status: "active", expiresAt: expires };
    }),

  cancel: orgAuthed
    .route({
      method: "POST",
      path: "/billing/cancel",
      summary: "Cancel subscription",
      tags: ["Billing"],
    })
    .output(z.any())
    .handler(async ({ context }) => {
      const db = getDb(context);
      await db
        .update(schema.organizations)
        .set({ subscriptionStatus: "cancelled" })
        .where(eq(schema.organizations.id, context.organization.id));
      return { ok: true, status: "cancelled" };
    }),
};
