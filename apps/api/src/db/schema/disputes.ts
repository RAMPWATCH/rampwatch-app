import { pgTable, uuid, text, numeric, timestamp, foreignKey } from "drizzle-orm/pg-core";
import { anchors } from "./anchors";
import { providers } from "./providers";

export const disputeStatusValues = ["open", "investigating", "resolved", "closed"] as const;
export type DisputeStatus = (typeof disputeStatusValues)[number];

export const disputes = pgTable("disputes", {
  id: uuid("id").primaryKey().defaultRandom(),
  anchorId: uuid("anchor_id")
    .notNull()
    .references(() => anchors.id),
  providerId: uuid("provider_id")
    .notNull()
    .references(() => providers.id),
  disputedAmount: numeric("disputed_amount").notNull(),
  reason: text("reason").notNull(),
  status: text("status")
    .$type<DisputeStatus>()
    .notNull()
    .default("open"),
  resolutionNotes: text("resolution_notes"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  resolvedAt: timestamp("resolved_at", { withTimezone: true }),
});

export type Dispute = typeof disputes.$inferSelect;
export type NewDispute = typeof disputes.$inferInsert;
