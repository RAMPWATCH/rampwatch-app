import { pgTable, uuid, text, numeric, timestamp, foreignKey } from "drizzle-orm/pg-core";
import { anchors } from "./anchors";
import { providers } from "./providers";

export const escrowStatusValues = ["active", "locked", "closed"] as const;
export type EscrowStatus = (typeof escrowStatusValues)[number];

export const escrowAccounts = pgTable("escrow_accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  anchorId: uuid("anchor_id").references(() => anchors.id),
  providerId: uuid("provider_id").references(() => providers.id),
  accountPublicKey: text("account_public_key").notNull(),
  totalLocked: numeric("total_locked").notNull().default("0"),
  totalReleased: numeric("total_released").notNull().default("0"),
  status: text("status")
    .$type<EscrowStatus>()
    .notNull()
    .default("active"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type EscrowAccount = typeof escrowAccounts.$inferSelect;
export type NewEscrowAccount = typeof escrowAccounts.$inferInsert;
