import { pgTable, uuid, text, numeric, integer, timestamp, foreignKey } from "drizzle-orm/pg-core";
import { anchors } from "./anchors";
import { providers } from "./providers";

export const usageStatusValues = ["pending", "billed", "paid", "refunded"] as const;
export type UsageStatus = (typeof usageStatusValues)[number];

export const usageReceipts = pgTable("usage_receipts", {
  id: uuid("id").primaryKey().defaultRandom(),
  anchorId: uuid("anchor_id")
    .notNull()
    .references(() => anchors.id),
  providerId: uuid("provider_id").references(() => providers.id),
  operation: text("operation").notNull(),
  quantity: integer("quantity").notNull().default(1),
  unitPrice: numeric("unit_price").notNull(),
  totalAmount: numeric("total_amount").notNull(),
  currency: text("currency").notNull().default("USD"),
  status: text("status")
    .$type<UsageStatus>()
    .notNull()
    .default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type UsageReceipt = typeof usageReceipts.$inferSelect;
export type NewUsageReceipt = typeof usageReceipts.$inferInsert;
