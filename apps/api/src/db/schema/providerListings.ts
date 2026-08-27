import { pgTable, uuid, text, numeric, boolean, timestamp, foreignKey } from "drizzle-orm/pg-core";
import { providers } from "./providers";

export const networkValues = ["mainnet", "testnet"] as const;
export type Network = (typeof networkValues)[number];

export const providerListings = pgTable("provider_listings", {
  id: uuid("id").primaryKey().defaultRandom(),
  providerId: uuid("provider_id")
    .notNull()
    .references(() => providers.id),
  asset: text("asset").notNull(),
  network: text("network").$type<Network>().notNull(),
  minAmount: numeric("min_amount"),
  maxAmount: numeric("max_amount"),
  rate: numeric("rate"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type ProviderListing = typeof providerListings.$inferSelect;
export type NewProviderListing = typeof providerListings.$inferInsert;
