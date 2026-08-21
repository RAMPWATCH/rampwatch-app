CREATE TABLE IF NOT EXISTS "platform_settings" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"price_check" text DEFAULT '0.02' NOT NULL,
	"price_full_report" text DEFAULT '0.10' NOT NULL,
	"price_verify_domain" text DEFAULT '0.05' NOT NULL,
	"x402_network" text DEFAULT 'stellar:testnet' NOT NULL,
	"payto_address" text NOT NULL,
	"scheduler_interval_minutes" integer DEFAULT 15 NOT NULL,
	"maintenance_mode" boolean DEFAULT false NOT NULL
);
