import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { anchors } from "./anchors";

export const triggeredByValues = [
  "scheduler",
  "x402_paid",
  "admin_manual",
] as const;
export type TriggeredBy = (typeof triggeredByValues)[number];

export const checkStatusValues = ["operational", "degraded", "down"] as const;
export type CheckStatus = (typeof checkStatusValues)[number];

export const checkRuns = pgTable("check_runs", {
  id: uuid("id").primaryKey().defaultRandom(),
  anchorId: uuid("anchor_id").references(() => anchors.id),
  domain: text("domain").notNull(),
  triggeredBy: text("triggered_by").$type<TriggeredBy>().notNull(),
  status: text("status").$type<CheckStatus>().notNull(),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
});

export type CheckRun = typeof checkRuns.$inferSelect;
export type NewCheckRun = typeof checkRuns.$inferInsert;
