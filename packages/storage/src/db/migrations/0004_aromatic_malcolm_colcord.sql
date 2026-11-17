CREATE TABLE IF NOT EXISTS "inventory_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"name" varchar(200) NOT NULL,
	"category" varchar(40) DEFAULT 'reagent' NOT NULL,
	"unit" varchar(40),
	"quantity" real DEFAULT 0 NOT NULL,
	"reorder_level" real DEFAULT 0 NOT NULL,
	"lot_number" varchar(80),
	"expiry_date" date,
	"supplier" varchar(200),
	"unit_cost" real,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "inventory_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"item_id" uuid NOT NULL,
	"type" varchar(20) NOT NULL,
	"quantity" real NOT NULL,
	"reference" varchar(120),
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "invoices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"order_id" uuid,
	"invoice_number" varchar(50) NOT NULL,
	"subtotal" real DEFAULT 0 NOT NULL,
	"discount" real DEFAULT 0 NOT NULL,
	"tax_percent" real DEFAULT 0 NOT NULL,
	"tax_amount" real DEFAULT 0 NOT NULL,
	"total" real DEFAULT 0 NOT NULL,
	"amount_paid" real DEFAULT 0 NOT NULL,
	"status" varchar(20) DEFAULT 'unpaid' NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"paid_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "order_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"test_id" uuid NOT NULL,
	"status" varchar(30) DEFAULT 'ordered' NOT NULL,
	"price" real DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"order_number" varchar(50) NOT NULL,
	"patient_id" uuid NOT NULL,
	"doctor_id" uuid,
	"priority" varchar(20) DEFAULT 'routine' NOT NULL,
	"status" varchar(30) DEFAULT 'ordered' NOT NULL,
	"ordered_at" timestamp with time zone DEFAULT now() NOT NULL,
	"clinical_notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "patients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"mrn" varchar(50) NOT NULL,
	"first_name" varchar(120) NOT NULL,
	"last_name" varchar(120),
	"date_of_birth" date,
	"gender" varchar(20),
	"lab_type" varchar(20) DEFAULT 'human' NOT NULL,
	"species" varchar(80),
	"breed" varchar(80),
	"owner_name" varchar(200),
	"phone" varchar(40),
	"email" varchar(255),
	"address" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invoice_id" uuid NOT NULL,
	"amount" real NOT NULL,
	"method" varchar(30) DEFAULT 'cash' NOT NULL,
	"reference" varchar(120),
	"paid_at" timestamp with time zone DEFAULT now() NOT NULL,
	"received_by" uuid
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "qc_results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"run_id" uuid NOT NULL,
	"analyte_id" uuid,
	"value" real NOT NULL,
	"mean" real,
	"sd" real,
	"cv" real,
	"flag" varchar(20)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "qc_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"test_id" uuid NOT NULL,
	"level" varchar(20) DEFAULT 'normal' NOT NULL,
	"lot_number" varchar(80),
	"run_date" date NOT NULL,
	"status" varchar(20) DEFAULT 'pass' NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "referring_doctors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"name" varchar(200) NOT NULL,
	"specialization" varchar(120),
	"hospital" varchar(200),
	"phone" varchar(40),
	"email" varchar(255),
	"commission_percent" real DEFAULT 0,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"order_id" uuid NOT NULL,
	"report_number" varchar(50) NOT NULL,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"generated_at" timestamp with time zone,
	"delivered_at" timestamp with time zone,
	"delivery_channel" varchar(40),
	"pdf_url" text,
	"remarks" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sample_id" uuid NOT NULL,
	"order_item_id" uuid NOT NULL,
	"analyte_id" uuid,
	"value" varchar(200),
	"numeric_value" real,
	"unit" varchar(40),
	"flag" varchar(20),
	"ref_low" real,
	"ref_high" real,
	"comment" text,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"entered_by" uuid,
	"entered_at" timestamp with time zone,
	"verified_by" uuid,
	"verified_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "samples" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"accession" varchar(50) NOT NULL,
	"order_id" uuid NOT NULL,
	"sample_type" varchar(80) NOT NULL,
	"container" varchar(80),
	"collected_at" timestamp with time zone,
	"received_at" timestamp with time zone,
	"status" varchar(30) DEFAULT 'collected' NOT NULL,
	"rejection_reason" text,
	"barcode" varchar(120),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "test_analytes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"test_id" uuid NOT NULL,
	"name" varchar(120) NOT NULL,
	"unit" varchar(40),
	"ref_low" real,
	"ref_high" real,
	"ref_text" varchar(200),
	"method" varchar(120),
	"sort_order" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "test_catalog" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"code" varchar(40) NOT NULL,
	"name" varchar(200) NOT NULL,
	"category" varchar(80),
	"sample_type" varchar(80),
	"lab_type" varchar(20) DEFAULT 'both' NOT NULL,
	"price" real DEFAULT 0 NOT NULL,
	"tat_hours" integer DEFAULT 24,
	"method" varchar(120),
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_inventory_items_org" ON "inventory_items" ("organization_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_inventory_items_name" ON "inventory_items" ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_inventory_tx_item" ON "inventory_transactions" ("item_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_invoices_org" ON "invoices" ("organization_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_invoices_order" ON "invoices" ("order_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "uq_invoices_org_number" ON "invoices" ("organization_id","invoice_number");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_invoices_status" ON "invoices" ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_order_items_order" ON "order_items" ("order_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_order_items_test" ON "order_items" ("test_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_orders_org" ON "orders" ("organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "uq_orders_org_number" ON "orders" ("organization_id","order_number");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_orders_patient" ON "orders" ("patient_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_orders_status" ON "orders" ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_orders_ordered_at" ON "orders" ("ordered_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_patients_org" ON "patients" ("organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "uq_patients_org_mrn" ON "patients" ("organization_id","mrn");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_patients_name" ON "patients" ("last_name","first_name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_patients_phone" ON "patients" ("phone");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_payments_invoice" ON "payments" ("invoice_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_qc_results_run" ON "qc_results" ("run_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_qc_runs_org" ON "qc_runs" ("organization_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_qc_runs_test" ON "qc_runs" ("test_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_qc_runs_date" ON "qc_runs" ("run_date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_referring_doctors_org" ON "referring_doctors" ("organization_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_referring_doctors_name" ON "referring_doctors" ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_reports_org" ON "reports" ("organization_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_reports_order" ON "reports" ("order_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "uq_reports_org_number" ON "reports" ("organization_id","report_number");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_results_sample" ON "results" ("sample_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_results_order_item" ON "results" ("order_item_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_results_status" ON "results" ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_samples_org" ON "samples" ("organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "uq_samples_org_accession" ON "samples" ("organization_id","accession");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_samples_order" ON "samples" ("order_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_samples_status" ON "samples" ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_test_analytes_test" ON "test_analytes" ("test_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_test_catalog_org" ON "test_catalog" ("organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "uq_test_catalog_org_code" ON "test_catalog" ("organization_id","code");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_test_catalog_name" ON "test_catalog" ("name");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "inventory_transactions" ADD CONSTRAINT "inventory_transactions_item_id_inventory_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "inventory_items"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "inventory_transactions" ADD CONSTRAINT "inventory_transactions_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "invoices" ADD CONSTRAINT "invoices_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "invoices" ADD CONSTRAINT "invoices_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "order_items" ADD CONSTRAINT "order_items_test_id_test_catalog_id_fk" FOREIGN KEY ("test_id") REFERENCES "test_catalog"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "orders" ADD CONSTRAINT "orders_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "orders" ADD CONSTRAINT "orders_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "orders" ADD CONSTRAINT "orders_doctor_id_referring_doctors_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "referring_doctors"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "orders" ADD CONSTRAINT "orders_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "patients" ADD CONSTRAINT "patients_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "patients" ADD CONSTRAINT "patients_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "payments" ADD CONSTRAINT "payments_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "payments" ADD CONSTRAINT "payments_received_by_users_id_fk" FOREIGN KEY ("received_by") REFERENCES "users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "qc_results" ADD CONSTRAINT "qc_results_run_id_qc_runs_id_fk" FOREIGN KEY ("run_id") REFERENCES "qc_runs"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "qc_results" ADD CONSTRAINT "qc_results_analyte_id_test_analytes_id_fk" FOREIGN KEY ("analyte_id") REFERENCES "test_analytes"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "qc_runs" ADD CONSTRAINT "qc_runs_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "qc_runs" ADD CONSTRAINT "qc_runs_test_id_test_catalog_id_fk" FOREIGN KEY ("test_id") REFERENCES "test_catalog"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "qc_runs" ADD CONSTRAINT "qc_runs_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "referring_doctors" ADD CONSTRAINT "referring_doctors_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "reports" ADD CONSTRAINT "reports_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "reports" ADD CONSTRAINT "reports_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "results" ADD CONSTRAINT "results_sample_id_samples_id_fk" FOREIGN KEY ("sample_id") REFERENCES "samples"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "results" ADD CONSTRAINT "results_order_item_id_order_items_id_fk" FOREIGN KEY ("order_item_id") REFERENCES "order_items"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "results" ADD CONSTRAINT "results_analyte_id_test_analytes_id_fk" FOREIGN KEY ("analyte_id") REFERENCES "test_analytes"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "results" ADD CONSTRAINT "results_entered_by_users_id_fk" FOREIGN KEY ("entered_by") REFERENCES "users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "results" ADD CONSTRAINT "results_verified_by_users_id_fk" FOREIGN KEY ("verified_by") REFERENCES "users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "samples" ADD CONSTRAINT "samples_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "samples" ADD CONSTRAINT "samples_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "test_analytes" ADD CONSTRAINT "test_analytes_test_id_test_catalog_id_fk" FOREIGN KEY ("test_id") REFERENCES "test_catalog"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "test_catalog" ADD CONSTRAINT "test_catalog_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
