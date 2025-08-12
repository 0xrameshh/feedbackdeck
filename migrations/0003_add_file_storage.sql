CREATE TABLE "stored_file" (
	"id" text PRIMARY KEY NOT NULL,
	"filename" text NOT NULL,
	"original_name" text NOT NULL,
	"path" text NOT NULL,
	"bucket" text NOT NULL,
	"size" integer NOT NULL,
	"mime_type" text NOT NULL,
	"checksum" text,
	"uploaded_by" text NOT NULL,
	"organization_id" text,
	"is_public" boolean DEFAULT false NOT NULL,
	"metadata" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "stored_file" ADD CONSTRAINT "stored_file_uploaded_by_user_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stored_file" ADD CONSTRAINT "stored_file_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;