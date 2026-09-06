CREATE TABLE "platform_setting" (
	"key" text PRIMARY KEY,
	"value" jsonb,
	"updated_by" uuid,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
