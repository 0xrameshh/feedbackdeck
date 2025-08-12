CREATE TYPE "public"."event_type" AS ENUM('user_action', 'page_view', 'feature_usage', 'system_event', 'business_event', 'error_event', 'performance', 'conversion');--> statement-breakpoint
CREATE TABLE "analytics_event" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"organization_id" text,
	"session_id" text NOT NULL,
	"event_type" "event_type" NOT NULL,
	"event_name" text NOT NULL,
	"properties" text,
	"metadata" text,
	"timestamp" timestamp NOT NULL,
	"ip" text,
	"user_agent" text,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "analytics_event" ADD CONSTRAINT "analytics_event_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;