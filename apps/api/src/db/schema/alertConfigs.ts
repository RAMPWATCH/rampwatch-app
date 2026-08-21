import { pgTable, uuid, text, boolean } from "drizzle-orm/pg-core";
import { anchors } from "./anchors";

export const alertChannelValues = ["email", "webhook"] as const;
export type AlertChannel = (typeof alertChannelValues)[number];

export const alertConfigs = pgTable("alert_configs", {
  id: uuid("id").primaryKey().defaultRandom(),
  anchorId: uuid("anchor_id")
    .notNull()
    .references(() => anchors.id),
  channel: text("channel").$type<AlertChannel>().notNull(),
  destination: text("destination").notNull(),
  isActive: boolean("is_active").notNull().default(true),
});

export type AlertConfig = typeof alertConfigs.$inferSelect;
export type NewAlertConfig = typeof alertConfigs.$inferInsert;
