/**
 * Billing Router
 *
 * Billing and subscription management endpoints.
 */

import { z } from "zod";
import { eq } from "drizzle-orm";
import Stripe from "stripe";
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

  createCheckout: orgAuthed
    .route({
      method: "POST",
      path: "/billing/checkout",
      summary: "Create a Stripe checkout session",
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
      const secret = process.env.STRIPE_SECRET_KEY;
      if (!secret) return { error: "Stripe not configured" };
      const stripe = new Stripe(secret);
      const plan = PLANS.find((p) => p.id === input.plan);
      if (!plan || plan.price === 0) return { error: "Invalid plan" };
      const interval = input.interval === "year" ? "year" : "month";
      const base = process.env.VITE_PUBLIC_SITE_URL || "http://localhost:3000";
      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        line_items: [
          {
            price_data: {
              currency: "inr",
              unit_amount: plan.price * 100,
              recurring: { interval },
              product_data: { name: `DiagnoAI ${plan.name}` },
            },
            quantity: 1,
          },
        ],
        success_url: `${base}/app/billing?success=1`,
        cancel_url: `${base}/app/billing?cancelled=1`,
        metadata: {
          orgId: context.organization.id,
          plan: plan.id,
          interval,
        },
      });
      return { url: session.url };
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
