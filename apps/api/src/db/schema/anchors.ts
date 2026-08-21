import { pgTable, uuid, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";

export const networkValues = ["mainnet", "testnet"] as const;
export type Network = (typeof networkValues)[number];

export const claimStatusValues = ["unclaimed", "pending", "claimed"] as const;
export type ClaimStatus = (typeof claimStatusValues)[number];

export const anchors = pgTable("anchors", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  domain: text("domain").notNull(),
  displayName: text("display_name"),
  network: text("network").$type<Network>().notNull(),
  claimedByUserId: uuid("claimed_by_user_id").references(() => users.id),
  claimStatus: text("claim_status")
    .$type<ClaimStatus>()
    .notNull()
    .default("unclaimed"),
  isHidden: boolean("is_hidden").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Anchor = typeof anchors.$inferSelect;
export type NewAnchor = typeof anchors.$inferInsert;
