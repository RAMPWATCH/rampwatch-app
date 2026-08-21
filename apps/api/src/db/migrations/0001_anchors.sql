CREATE TABLE IF NOT EXISTS "anchors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"domain" text NOT NULL,
	"display_name" text,
	"network" text NOT NULL,
	"claimed_by_user_id" uuid,
	"claim_status" text DEFAULT 'unclaimed' NOT NULL,
	"is_hidden" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "anchors_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "anchors" ADD CONSTRAINT "anchors_claimed_by_user_id_users_id_fk" FOREIGN KEY ("claimed_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
