CREATE TABLE IF NOT EXISTS "sep_check_results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"check_run_id" uuid NOT NULL,
	"sep_type" text NOT NULL,
	"passed" boolean NOT NULL,
	"latency_ms" integer,
	"error_detail" text,
	"raw_response" jsonb
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sep_check_results" ADD CONSTRAINT "sep_check_results_check_run_id_check_runs_id_fk" FOREIGN KEY ("check_run_id") REFERENCES "public"."check_runs"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
