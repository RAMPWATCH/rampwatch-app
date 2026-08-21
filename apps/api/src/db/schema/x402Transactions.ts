import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { checkRuns } from "./checkRuns";

export const x402StatusValues = ["pending", "settled", "failed"] as const;
export type X402Status = (typeof x402StatusValues)[number];

export const x402Transactions = pgTable("x402_transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  payerAddress: text("payer_address").notNull(),
  endpoint: text("endpoint").notNull(),
  // Minor-unit-safe string amount, e.g. "0.02" — never a float column.
  amount: text("amount").notNull(),
  asset: text("asset").notNull(),
  txHash: text("tx_hash"),
  status: text("status").$type<X402Status>().notNull(),
  checkRunId: uuid("check_run_id").references(() => checkRuns.id),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type X402Transaction = typeof x402Transactions.$inferSelect;
export type NewX402Transaction = typeof x402Transactions.$inferInsert;
