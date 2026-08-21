CREATE TABLE IF NOT EXISTS "x402_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"payer_address" text NOT NULL,
	"endpoint" text NOT NULL,
	"amount" text NOT NULL,
	"asset" text NOT NULL,
	"tx_hash" text,
	"status" text NOT NULL,
	"check_run_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "x402_transactions" ADD CONSTRAINT "x402_transactions_check_run_id_check_runs_id_fk" FOREIGN KEY ("check_run_id") REFERENCES "public"."check_runs"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
