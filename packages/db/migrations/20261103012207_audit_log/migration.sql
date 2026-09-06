CREATE TABLE "audit_log" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7(),
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL,
	"actor_user_id" uuid,
	"organization_id" uuid,
	"action" text NOT NULL,
	"target_type" text NOT NULL,
	"target_id" text NOT NULL,
	"metadata" jsonb DEFAULT '{}' NOT NULL,
	"ip" inet,
	"request_id" text
);
--> statement-breakpoint
CREATE INDEX "audit_log_organization_id_id_index" ON "audit_log" ("organization_id","id" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "audit_log_actor_user_id_id_index" ON "audit_log" ("actor_user_id","id" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "audit_log_target_type_target_id_id_index" ON "audit_log" ("target_type","target_id","id" DESC NULLS LAST);