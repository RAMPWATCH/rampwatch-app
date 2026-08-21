import {
  pgTable,
  uuid,
  text,
  boolean,
  integer,
  jsonb,
} from "drizzle-orm/pg-core";
import { checkRuns } from "./checkRuns";

export const sepTypeValues = [
  "sep1",
  "sep6",
  "sep10",
  "sep24",
  "sep38",
] as const;
export type SepType = (typeof sepTypeValues)[number];

export const sepCheckResults = pgTable("sep_check_results", {
  id: uuid("id").primaryKey().defaultRandom(),
  checkRunId: uuid("check_run_id")
    .notNull()
    .references(() => checkRuns.id),
  sepType: text("sep_type").$type<SepType>().notNull(),
  passed: boolean("passed").notNull(),
  latencyMs: integer("latency_ms"),
  errorDetail: text("error_detail"),
  rawResponse: jsonb("raw_response"),
});

export type SepCheckResult = typeof sepCheckResults.$inferSelect;
export type NewSepCheckResult = typeof sepCheckResults.$inferInsert;
