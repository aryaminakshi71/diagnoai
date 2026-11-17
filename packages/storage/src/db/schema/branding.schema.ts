import { pgTable, uuid, text, varchar, timestamp, index } from "drizzle-orm/pg-core";

// White-label branding per organization
export const whiteLabelSettings = pgTable(
  "white_label_settings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id").notNull().unique(),
    brandName: varchar("brand_name", { length: 120 }).notNull().default("DiagnoAI"),
    logoUrl: text("logo_url"),
    primaryColor: varchar("primary_color", { length: 20 }).notNull().default("#6366f1"),
    supportEmail: varchar("support_email", { length: 180 }),
    customDomain: varchar("custom_domain", { length: 180 }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({ orgIdx: index("idx_white_label_org").on(t.organizationId) }),
);
