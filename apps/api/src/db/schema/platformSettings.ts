import { pgTable, integer, text, boolean } from "drizzle-orm/pg-core";

// Single-row runtime config table — id is always 1.
export const platformSettings = pgTable("platform_settings", {
  id: integer("id").primaryKey().default(1),
  priceCheck: text("price_check").notNull().default("0.02"),
  priceFullReport: text("price_full_report").notNull().default("0.10"),
  priceVerifyDomain: text("price_verify_domain").notNull().default("0.05"),
  x402Network: text("x402_network").notNull().default("stellar:testnet"),
  paytoAddress: text("payto_address").notNull(),
  schedulerIntervalMinutes: integer("scheduler_interval_minutes")
    .notNull()
    .default(15),
  maintenanceMode: boolean("maintenance_mode").notNull().default(false),
});

export type PlatformSettings = typeof platformSettings.$inferSelect;
export type NewPlatformSettings = typeof platformSettings.$inferInsert;

export const PLATFORM_SETTINGS_ROW_ID = 1;
