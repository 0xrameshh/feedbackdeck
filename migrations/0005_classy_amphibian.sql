ALTER TABLE "admin_log" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "analytics_event" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "email_preferences" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "invitation" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "payment_method" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "stored_file" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "subscription" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "admin_log" CASCADE;--> statement-breakpoint
DROP TABLE "analytics_event" CASCADE;--> statement-breakpoint
DROP TABLE "email_preferences" CASCADE;--> statement-breakpoint
DROP TABLE "invitation" CASCADE;--> statement-breakpoint
DROP TABLE "payment_method" CASCADE;--> statement-breakpoint
DROP TABLE "stored_file" CASCADE;--> statement-breakpoint
DROP TABLE "subscription" CASCADE;--> statement-breakpoint
ALTER TABLE "webhook_event" DROP CONSTRAINT "webhook_event_stripe_event_id_unique";--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "system_role" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "system_role" SET DEFAULT 'user'::text;--> statement-breakpoint
DROP TYPE "public"."system_role";--> statement-breakpoint
CREATE TYPE "public"."system_role" AS ENUM('user', 'admin');--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "system_role" SET DEFAULT 'user'::"public"."system_role";--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "system_role" SET DATA TYPE "public"."system_role" USING "system_role"::"public"."system_role";--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN "polar_customer_id" text;--> statement-breakpoint
ALTER TABLE "webhook_event" ADD COLUMN "polar_event_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "organization" DROP COLUMN "logo";--> statement-breakpoint
ALTER TABLE "organization" DROP COLUMN "metadata";--> statement-breakpoint
ALTER TABLE "organization" DROP COLUMN "stripe_customer_id";--> statement-breakpoint
ALTER TABLE "organization" DROP COLUMN "trial_ends_at";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "is_active";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "last_login_at";--> statement-breakpoint
ALTER TABLE "webhook_event" DROP COLUMN "stripe_event_id";--> statement-breakpoint
ALTER TABLE "webhook_event" DROP COLUMN "processing_error";--> statement-breakpoint
ALTER TABLE "webhook_event" DROP COLUMN "processed_at";--> statement-breakpoint
ALTER TABLE "webhook_event" ADD CONSTRAINT "webhook_event_polar_event_id_unique" UNIQUE("polar_event_id");--> statement-breakpoint
DROP TYPE "public"."event_type";