CREATE TABLE IF NOT EXISTS "daily_expenditure_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"register_id" uuid NOT NULL,
	"day_number" integer NOT NULL,
	"amount" real,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "daily_expenditure_registers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"sno" integer,
	"particulars" text NOT NULL,
	"o_b" varchar(50),
	"month" integer,
	"year" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid NOT NULL,
	"updated_by" uuid
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "dispatch_registers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"d_no" varchar(100),
	"date" date NOT NULL,
	"to" varchar(255),
	"subject" text,
	"remarks" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid NOT NULL,
	"updated_by" uuid
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ledger_registers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"sr_no" integer,
	"name_of_article" varchar(255),
	"date_of_supply" date,
	"qty_in_hands" real,
	"receiving_date_ddd_lab" date,
	"received_date" date,
	"received_source" varchar(255),
	"quantity" real,
	"total_qty" real,
	"servicable" varchar(50),
	"remarks" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid NOT NULL,
	"updated_by" uuid
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "psks_cashbook_registers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"date" date NOT NULL,
	"particulars" text,
	"o_b" varchar(50),
	"date_expenditure" date,
	"particulars_expenditure" text,
	"expenditure" real,
	"debited_amount" real,
	"c_b" varchar(50),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid NOT NULL,
	"updated_by" uuid
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "psks_entry_registers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"sr_no" integer,
	"date_of_bill" date NOT NULL,
	"description_of_goods_services" text,
	"quantity" real,
	"hsn_code" varchar(50),
	"rate_per_item" real,
	"total_amount" real,
	"source" varchar(255),
	"bill_invoice_no" varchar(100),
	"remark" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid NOT NULL,
	"updated_by" uuid
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "psks_ledger_registers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"sr_no" integer,
	"name_of_article" varchar(255),
	"date_of_supply" date,
	"qty_in_hands" real,
	"receiving_date_ddd_lab" date,
	"received_date" date,
	"received_source" varchar(255),
	"quantity" real,
	"total_qty" real,
	"servicable" varchar(50),
	"remarks" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid NOT NULL,
	"updated_by" uuid
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "psks_stock_registers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"sr_no" integer,
	"particulars" text,
	"page_no" varchar(50),
	"date" date,
	"o_b" varchar(50),
	"date_source" date,
	"source" varchar(255),
	"quantity" real,
	"t_quantity" real,
	"c_m" varchar(50),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid NOT NULL,
	"updated_by" uuid
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "white_label_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"brand_name" varchar(120) DEFAULT 'DiagnoAI' NOT NULL,
	"logo_url" text,
	"primary_color" varchar(20) DEFAULT '#6366f1' NOT NULL,
	"support_email" varchar(180),
	"custom_domain" varchar(180),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "white_label_settings_organization_id_unique" UNIQUE("organization_id")
);
--> statement-breakpoint
ALTER TABLE "entry_registers" ALTER COLUMN "quantity" SET DATA TYPE real;--> statement-breakpoint
ALTER TABLE "entry_registers" ALTER COLUMN "rate" SET DATA TYPE real;--> statement-breakpoint
ALTER TABLE "entry_registers" ALTER COLUMN "gst_percent" SET DATA TYPE real;--> statement-breakpoint
ALTER TABLE "entry_registers" ALTER COLUMN "rate_with_gst" SET DATA TYPE real;--> statement-breakpoint
ALTER TABLE "entry_registers" ALTER COLUMN "total_with_gst" SET DATA TYPE real;--> statement-breakpoint
ALTER TABLE "stock_registers" ALTER COLUMN "quantity" SET DATA TYPE real;--> statement-breakpoint
ALTER TABLE "stock_registers" ALTER COLUMN "t_quantity" SET DATA TYPE real;--> statement-breakpoint
ALTER TABLE "biochemistry_registers" ALTER COLUMN "alt_u_l" SET DATA TYPE real;--> statement-breakpoint
ALTER TABLE "biochemistry_registers" ALTER COLUMN "urea_mg_dl" SET DATA TYPE real;--> statement-breakpoint
ALTER TABLE "biochemistry_registers" ALTER COLUMN "glucose_mg_dl" SET DATA TYPE real;--> statement-breakpoint
ALTER TABLE "biochemistry_registers" ADD COLUMN "opd_register_id" uuid;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_daily_expenditure_entries_register_id" ON "daily_expenditure_entries" ("register_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_daily_expenditure_entries_day_number" ON "daily_expenditure_entries" ("day_number");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_daily_expenditure_registers_organization_id" ON "daily_expenditure_registers" ("organization_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_daily_expenditure_registers_month_year" ON "daily_expenditure_registers" ("month","year");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_daily_expenditure_registers_created_at" ON "daily_expenditure_registers" ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_dispatch_registers_organization_id" ON "dispatch_registers" ("organization_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_dispatch_registers_d_no" ON "dispatch_registers" ("d_no");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_dispatch_registers_date" ON "dispatch_registers" ("date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_dispatch_registers_created_at" ON "dispatch_registers" ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_ledger_registers_organization_id" ON "ledger_registers" ("organization_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_ledger_registers_sr_no" ON "ledger_registers" ("sr_no");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_ledger_registers_name_of_article" ON "ledger_registers" ("name_of_article");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_ledger_registers_created_at" ON "ledger_registers" ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_psks_cashbook_registers_organization_id" ON "psks_cashbook_registers" ("organization_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_psks_cashbook_registers_date" ON "psks_cashbook_registers" ("date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_psks_cashbook_registers_created_at" ON "psks_cashbook_registers" ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_psks_entry_registers_organization_id" ON "psks_entry_registers" ("organization_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_psks_entry_registers_sr_no" ON "psks_entry_registers" ("sr_no");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_psks_entry_registers_date_of_bill" ON "psks_entry_registers" ("date_of_bill");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_psks_entry_registers_bill_invoice_no" ON "psks_entry_registers" ("bill_invoice_no");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_psks_entry_registers_created_at" ON "psks_entry_registers" ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_psks_ledger_registers_organization_id" ON "psks_ledger_registers" ("organization_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_psks_ledger_registers_sr_no" ON "psks_ledger_registers" ("sr_no");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_psks_ledger_registers_name_of_article" ON "psks_ledger_registers" ("name_of_article");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_psks_ledger_registers_created_at" ON "psks_ledger_registers" ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_psks_stock_registers_organization_id" ON "psks_stock_registers" ("organization_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_psks_stock_registers_sr_no" ON "psks_stock_registers" ("sr_no");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_psks_stock_registers_date" ON "psks_stock_registers" ("date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_psks_stock_registers_created_at" ON "psks_stock_registers" ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_white_label_org" ON "white_label_settings" ("organization_id");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "biochemistry_registers" ADD CONSTRAINT "biochemistry_registers_opd_register_id_opd_registers_id_fk" FOREIGN KEY ("opd_register_id") REFERENCES "opd_registers"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "daily_expenditure_entries" ADD CONSTRAINT "daily_expenditure_entries_register_id_daily_expenditure_registers_id_fk" FOREIGN KEY ("register_id") REFERENCES "daily_expenditure_registers"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "daily_expenditure_registers" ADD CONSTRAINT "daily_expenditure_registers_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "daily_expenditure_registers" ADD CONSTRAINT "daily_expenditure_registers_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "daily_expenditure_registers" ADD CONSTRAINT "daily_expenditure_registers_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "dispatch_registers" ADD CONSTRAINT "dispatch_registers_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "dispatch_registers" ADD CONSTRAINT "dispatch_registers_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "dispatch_registers" ADD CONSTRAINT "dispatch_registers_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ledger_registers" ADD CONSTRAINT "ledger_registers_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ledger_registers" ADD CONSTRAINT "ledger_registers_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ledger_registers" ADD CONSTRAINT "ledger_registers_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "psks_cashbook_registers" ADD CONSTRAINT "psks_cashbook_registers_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "psks_cashbook_registers" ADD CONSTRAINT "psks_cashbook_registers_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "psks_cashbook_registers" ADD CONSTRAINT "psks_cashbook_registers_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "psks_entry_registers" ADD CONSTRAINT "psks_entry_registers_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "psks_entry_registers" ADD CONSTRAINT "psks_entry_registers_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "psks_entry_registers" ADD CONSTRAINT "psks_entry_registers_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "psks_ledger_registers" ADD CONSTRAINT "psks_ledger_registers_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "psks_ledger_registers" ADD CONSTRAINT "psks_ledger_registers_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "psks_ledger_registers" ADD CONSTRAINT "psks_ledger_registers_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "psks_stock_registers" ADD CONSTRAINT "psks_stock_registers_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "psks_stock_registers" ADD CONSTRAINT "psks_stock_registers_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "psks_stock_registers" ADD CONSTRAINT "psks_stock_registers_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
