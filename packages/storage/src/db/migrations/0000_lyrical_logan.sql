CREATE TABLE IF NOT EXISTS "accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"account_id" varchar(255) NOT NULL,
	"provider_id" varchar(100) NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"expires_at" timestamp with time zone,
	"id_token" text,
	"scope" text,
	"password" varchar(255),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "organization_memberships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"organization_id" uuid NOT NULL,
	"role" varchar(50) DEFAULT 'member' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "organizations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"plan" varchar(50) DEFAULT 'free' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "organizations_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"token" varchar(500) NOT NULL,
	"ip_address" varchar(100),
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"name" varchar(255),
	"image" varchar(500),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "verifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"identifier" varchar(255) NOT NULL,
	"value" varchar(500) NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "billing_subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"plan" varchar(50) DEFAULT 'free' NOT NULL,
	"status" varchar(50) DEFAULT 'active' NOT NULL,
	"cancel_at_period_end" boolean DEFAULT false NOT NULL,
	"current_period_start" timestamp with time zone,
	"current_period_end" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"title" varchar(500) NOT NULL,
	"content" text,
	"status" varchar(50) DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ticket_attachments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ticket_id" uuid NOT NULL,
	"comment_id" uuid,
	"file_name" varchar(255) NOT NULL,
	"file_key" varchar(500) NOT NULL,
	"file_size" varchar(50),
	"mime_type" varchar(100),
	"uploaded_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ticket_comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ticket_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"content" text NOT NULL,
	"is_internal" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ticket_tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ticket_id" uuid NOT NULL,
	"tag" varchar(100) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tickets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"ticket_number" varchar(50) NOT NULL,
	"subject" varchar(500) NOT NULL,
	"description" text,
	"status" varchar(50) DEFAULT 'open' NOT NULL,
	"priority" varchar(20) DEFAULT 'medium',
	"category" varchar(100),
	"assigned_to" uuid,
	"created_by" uuid NOT NULL,
	"requester_name" varchar(255),
	"requester_email" varchar(255),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"resolved_at" timestamp with time zone,
	"closed_at" timestamp with time zone,
	CONSTRAINT "tickets_ticket_number_unique" UNIQUE("ticket_number")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "knowledge_base_articles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"excerpt" text,
	"category" varchar(100),
	"tags" text[],
	"is_published" boolean DEFAULT false NOT NULL,
	"view_count" integer DEFAULT 0 NOT NULL,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sla_rules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"priority" varchar(20),
	"first_response_time" integer,
	"resolution_time" integer,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sla_status" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ticket_id" uuid NOT NULL,
	"rule_id" uuid,
	"first_response_due" timestamp with time zone,
	"first_response_at" timestamp with time zone,
	"first_response_breached" boolean DEFAULT false NOT NULL,
	"resolution_due" timestamp with time zone,
	"resolved_at" timestamp with time zone,
	"resolution_breached" boolean DEFAULT false NOT NULL,
	"current_status" varchar(20) DEFAULT 'on_track',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sla_status_ticket_id_unique" UNIQUE("ticket_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "canned_responses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"category" varchar(100),
	"tags" text[],
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "entry_registers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"invoice" varchar(100),
	"receiving_date" date NOT NULL,
	"name_of_article" varchar(255) NOT NULL,
	"pack_size" varchar(100),
	"quantity" numeric(10, 2) NOT NULL,
	"rate" numeric(10, 2),
	"gst_percent" numeric(5, 2),
	"rate_with_gst" numeric(10, 2),
	"total_with_gst" numeric(10, 2),
	"source" varchar(255),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid NOT NULL,
	"updated_by" uuid
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "opd_registers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"date" date NOT NULL,
	"yearly_no" varchar(50),
	"monthly_no" varchar(50),
	"daily_no" varchar(50),
	"owner_name" varchar(255),
	"address" text,
	"species" varchar(100),
	"sample_code" varchar(100),
	"test_performed" varchar(255),
	"result" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid NOT NULL,
	"updated_by" uuid
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "stock_registers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"sr_no" integer,
	"particulars" text,
	"page_no" varchar(50),
	"date" date,
	"o_b" varchar(50),
	"date_source" date,
	"source" varchar(255),
	"quantity" numeric(10, 2),
	"t_quantity" numeric(10, 2),
	"c_m" varchar(50),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid NOT NULL,
	"updated_by" uuid
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "biochemistry_registers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"date" date NOT NULL,
	"yearly_no" varchar(50),
	"monthly_no" varchar(50),
	"daily_no" varchar(50),
	"owner_name" varchar(255),
	"village" varchar(255),
	"species" varchar(100),
	"age" varchar(50),
	"sex" varchar(10),
	"alt_u_l" numeric(10, 2),
	"urea_mg_dl" numeric(10, 2),
	"glucose_mg_dl" numeric(10, 2),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid NOT NULL,
	"updated_by" uuid
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "brucella_rbpt_registers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"date" date NOT NULL,
	"yearly_no" varchar(50),
	"monthly_no" varchar(50),
	"daily_no" varchar(50),
	"name" varchar(255),
	"village" varchar(255),
	"gvh" varchar(255),
	"species" varchar(100),
	"age" varchar(50),
	"sex" varchar(10),
	"test_result" varchar(100),
	"remarks" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid NOT NULL,
	"updated_by" uuid
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "brucella_sero_registers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"sr_no" integer,
	"owner_name" varchar(255),
	"village" varchar(255),
	"name_of_gvh" varchar(255),
	"species" varchar(100),
	"age" varchar(50),
	"sex" varchar(10),
	"tag_no" varchar(100),
	"date_of_sampling" date,
	"date_of_vaccination" date,
	"test_result" varchar(100),
	"remarks" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid NOT NULL,
	"updated_by" uuid
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "fmd_registers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"sample_id_cryovial_code" varchar(100),
	"date_of_sampling" date NOT NULL,
	"owner_name" varchar(255),
	"village" varchar(255),
	"block_tehsil" varchar(255),
	"district" varchar(255),
	"pin_code" varchar(10),
	"species" varchar(100),
	"age_months" integer,
	"sex" varchar(10),
	"clinical_signs" text,
	"test_result" varchar(100),
	"remarks" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid NOT NULL,
	"updated_by" uuid
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "bird_flu_registers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"sr_no" integer,
	"location" varchar(255),
	"name_address_telephone_sender" text,
	"village_ward_area" varchar(255),
	"total_samples" integer,
	"poultry_type" varchar(255),
	"flexible_data" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid NOT NULL,
	"updated_by" uuid
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "abst_registers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"date" date NOT NULL,
	"yearly_no" varchar(50),
	"monthly_no" varchar(50),
	"daily_no" varchar(50),
	"owner_name" varchar(255),
	"address" text,
	"species" varchar(100),
	"sample_type" varchar(100),
	"referred_by_gvh" varchar(255),
	"history" text,
	"earlier_treatment_yes_no" varchar(10),
	"sample_code_on_media" varchar(100),
	"sample_brought_in" varchar(100),
	"bacteria_isolated_no_growth" varchar(100),
	"antibiotic_results" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid NOT NULL,
	"updated_by" uuid
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_accounts_user_id" ON "accounts" ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_accounts_provider_account" ON "accounts" ("provider_id","account_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_org_memberships_user_id" ON "organization_memberships" ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_org_memberships_org_id" ON "organization_memberships" ("organization_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_org_memberships_user_org" ON "organization_memberships" ("user_id","organization_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_organizations_slug" ON "organizations" ("slug");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_sessions_user_id" ON "sessions" ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_sessions_token" ON "sessions" ("token");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_users_email" ON "users" ("email");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_verifications_identifier" ON "verifications" ("identifier");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_notes_organization_id" ON "notes" ("organization_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_notes_status" ON "notes" ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_notes_created_at" ON "notes" ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_ticket_attachments_ticket_id" ON "ticket_attachments" ("ticket_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_ticket_attachments_comment_id" ON "ticket_attachments" ("comment_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_ticket_comments_ticket_id" ON "ticket_comments" ("ticket_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_ticket_comments_user_id" ON "ticket_comments" ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_ticket_comments_created_at" ON "ticket_comments" ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_ticket_tags_ticket_id" ON "ticket_tags" ("ticket_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_ticket_tags_tag" ON "ticket_tags" ("tag");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_ticket_tags_ticket_tag" ON "ticket_tags" ("ticket_id","tag");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_tickets_organization_id" ON "tickets" ("organization_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_tickets_status" ON "tickets" ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_tickets_priority" ON "tickets" ("priority");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_tickets_assigned_to" ON "tickets" ("assigned_to");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_tickets_created_by" ON "tickets" ("created_by");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_tickets_ticket_number" ON "tickets" ("ticket_number");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_kb_articles_organization_id" ON "knowledge_base_articles" ("organization_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_kb_articles_slug" ON "knowledge_base_articles" ("slug");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_kb_articles_category" ON "knowledge_base_articles" ("category");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_kb_articles_is_published" ON "knowledge_base_articles" ("is_published");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_kb_articles_org_slug" ON "knowledge_base_articles" ("organization_id","slug");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_sla_rules_organization_id" ON "sla_rules" ("organization_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_sla_rules_priority" ON "sla_rules" ("priority");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_sla_rules_org_priority" ON "sla_rules" ("organization_id","priority");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_sla_status_ticket_id" ON "sla_status" ("ticket_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_sla_status_rule_id" ON "sla_status" ("rule_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_sla_status_current_status" ON "sla_status" ("current_status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_canned_responses_organization_id" ON "canned_responses" ("organization_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_canned_responses_category" ON "canned_responses" ("category");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_entry_registers_organization_id" ON "entry_registers" ("organization_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_entry_registers_receiving_date" ON "entry_registers" ("receiving_date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_entry_registers_invoice" ON "entry_registers" ("invoice");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_entry_registers_created_at" ON "entry_registers" ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_opd_registers_organization_id" ON "opd_registers" ("organization_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_opd_registers_date" ON "opd_registers" ("date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_opd_registers_yearly_no" ON "opd_registers" ("yearly_no");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_opd_registers_monthly_no" ON "opd_registers" ("monthly_no");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_opd_registers_daily_no" ON "opd_registers" ("daily_no");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_opd_registers_owner_name" ON "opd_registers" ("owner_name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_opd_registers_sample_code" ON "opd_registers" ("sample_code");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_opd_registers_created_at" ON "opd_registers" ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_stock_registers_organization_id" ON "stock_registers" ("organization_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_stock_registers_sr_no" ON "stock_registers" ("sr_no");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_stock_registers_date" ON "stock_registers" ("date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_stock_registers_particulars" ON "stock_registers" ("particulars");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_stock_registers_created_at" ON "stock_registers" ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_biochemistry_registers_organization_id" ON "biochemistry_registers" ("organization_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_biochemistry_registers_date" ON "biochemistry_registers" ("date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_biochemistry_registers_yearly_no" ON "biochemistry_registers" ("yearly_no");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_biochemistry_registers_monthly_no" ON "biochemistry_registers" ("monthly_no");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_biochemistry_registers_daily_no" ON "biochemistry_registers" ("daily_no");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_biochemistry_registers_owner_name" ON "biochemistry_registers" ("owner_name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_biochemistry_registers_created_at" ON "biochemistry_registers" ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_brucella_rbpt_registers_organization_id" ON "brucella_rbpt_registers" ("organization_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_brucella_rbpt_registers_date" ON "brucella_rbpt_registers" ("date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_brucella_rbpt_registers_yearly_no" ON "brucella_rbpt_registers" ("yearly_no");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_brucella_rbpt_registers_name" ON "brucella_rbpt_registers" ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_brucella_rbpt_registers_created_at" ON "brucella_rbpt_registers" ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_brucella_sero_registers_organization_id" ON "brucella_sero_registers" ("organization_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_brucella_sero_registers_sr_no" ON "brucella_sero_registers" ("sr_no");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_brucella_sero_registers_owner_name" ON "brucella_sero_registers" ("owner_name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_brucella_sero_registers_tag_no" ON "brucella_sero_registers" ("tag_no");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_brucella_sero_registers_created_at" ON "brucella_sero_registers" ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_fmd_registers_organization_id" ON "fmd_registers" ("organization_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_fmd_registers_sample_id" ON "fmd_registers" ("sample_id_cryovial_code");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_fmd_registers_date_of_sampling" ON "fmd_registers" ("date_of_sampling");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_fmd_registers_owner_name" ON "fmd_registers" ("owner_name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_fmd_registers_district" ON "fmd_registers" ("district");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_fmd_registers_created_at" ON "fmd_registers" ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_bird_flu_registers_organization_id" ON "bird_flu_registers" ("organization_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_bird_flu_registers_location" ON "bird_flu_registers" ("location");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_bird_flu_registers_sr_no" ON "bird_flu_registers" ("sr_no");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_bird_flu_registers_created_at" ON "bird_flu_registers" ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_abst_registers_organization_id" ON "abst_registers" ("organization_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_abst_registers_date" ON "abst_registers" ("date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_abst_registers_yearly_no" ON "abst_registers" ("yearly_no");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_abst_registers_owner_name" ON "abst_registers" ("owner_name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_abst_registers_sample_code" ON "abst_registers" ("sample_code_on_media");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_abst_registers_created_at" ON "abst_registers" ("created_at");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "organization_memberships" ADD CONSTRAINT "organization_memberships_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "organization_memberships" ADD CONSTRAINT "organization_memberships_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "billing_subscriptions" ADD CONSTRAINT "billing_subscriptions_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "notes" ADD CONSTRAINT "notes_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ticket_attachments" ADD CONSTRAINT "ticket_attachments_ticket_id_tickets_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "tickets"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ticket_attachments" ADD CONSTRAINT "ticket_attachments_comment_id_ticket_comments_id_fk" FOREIGN KEY ("comment_id") REFERENCES "ticket_comments"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ticket_attachments" ADD CONSTRAINT "ticket_attachments_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "users"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ticket_comments" ADD CONSTRAINT "ticket_comments_ticket_id_tickets_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "tickets"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ticket_comments" ADD CONSTRAINT "ticket_comments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ticket_tags" ADD CONSTRAINT "ticket_tags_ticket_id_tickets_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "tickets"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tickets" ADD CONSTRAINT "tickets_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tickets" ADD CONSTRAINT "tickets_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tickets" ADD CONSTRAINT "tickets_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "knowledge_base_articles" ADD CONSTRAINT "knowledge_base_articles_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "knowledge_base_articles" ADD CONSTRAINT "knowledge_base_articles_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sla_rules" ADD CONSTRAINT "sla_rules_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sla_status" ADD CONSTRAINT "sla_status_ticket_id_tickets_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "tickets"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sla_status" ADD CONSTRAINT "sla_status_rule_id_sla_rules_id_fk" FOREIGN KEY ("rule_id") REFERENCES "sla_rules"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "canned_responses" ADD CONSTRAINT "canned_responses_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "canned_responses" ADD CONSTRAINT "canned_responses_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "entry_registers" ADD CONSTRAINT "entry_registers_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "entry_registers" ADD CONSTRAINT "entry_registers_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "entry_registers" ADD CONSTRAINT "entry_registers_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "opd_registers" ADD CONSTRAINT "opd_registers_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "opd_registers" ADD CONSTRAINT "opd_registers_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "opd_registers" ADD CONSTRAINT "opd_registers_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "stock_registers" ADD CONSTRAINT "stock_registers_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "stock_registers" ADD CONSTRAINT "stock_registers_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "stock_registers" ADD CONSTRAINT "stock_registers_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "biochemistry_registers" ADD CONSTRAINT "biochemistry_registers_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "biochemistry_registers" ADD CONSTRAINT "biochemistry_registers_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "biochemistry_registers" ADD CONSTRAINT "biochemistry_registers_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "brucella_rbpt_registers" ADD CONSTRAINT "brucella_rbpt_registers_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "brucella_rbpt_registers" ADD CONSTRAINT "brucella_rbpt_registers_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "brucella_rbpt_registers" ADD CONSTRAINT "brucella_rbpt_registers_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "brucella_sero_registers" ADD CONSTRAINT "brucella_sero_registers_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "brucella_sero_registers" ADD CONSTRAINT "brucella_sero_registers_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "brucella_sero_registers" ADD CONSTRAINT "brucella_sero_registers_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "fmd_registers" ADD CONSTRAINT "fmd_registers_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "fmd_registers" ADD CONSTRAINT "fmd_registers_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "fmd_registers" ADD CONSTRAINT "fmd_registers_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bird_flu_registers" ADD CONSTRAINT "bird_flu_registers_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bird_flu_registers" ADD CONSTRAINT "bird_flu_registers_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bird_flu_registers" ADD CONSTRAINT "bird_flu_registers_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "abst_registers" ADD CONSTRAINT "abst_registers_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "abst_registers" ADD CONSTRAINT "abst_registers_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "abst_registers" ADD CONSTRAINT "abst_registers_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
