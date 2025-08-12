CREATE TYPE "public"."feedback_category" AS ENUM('general', 'bug', 'feature', 'praise');--> statement-breakpoint
CREATE TYPE "public"."feedback_status" AS ENUM('unread', 'read', 'responded', 'archived');--> statement-breakpoint
CREATE TABLE "feedback" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"message" text NOT NULL,
	"category" "feedback_category" NOT NULL,
	"user_email" text,
	"page_url" text NOT NULL,
	"user_agent" text,
	"ip_address" text,
	"status" "feedback_status" DEFAULT 'unread',
	"metadata" json DEFAULT '{}'::json,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "feedback_response" (
	"id" text PRIMARY KEY NOT NULL,
	"feedback_id" text NOT NULL,
	"admin_id" text NOT NULL,
	"message" text NOT NULL,
	"sent_at" timestamp NOT NULL,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"name" text NOT NULL,
	"domain" text NOT NULL,
	"widget_settings" json DEFAULT '{}'::json,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback_response" ADD CONSTRAINT "feedback_response_feedback_id_feedback_id_fk" FOREIGN KEY ("feedback_id") REFERENCES "public"."feedback"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback_response" ADD CONSTRAINT "feedback_response_admin_id_user_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project" ADD CONSTRAINT "project_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;