import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { anchors } from "./anchors";
import { users } from "./users";

export const verificationMethodValues = ["dns_txt", "well_known_file"] as const;
export type VerificationMethod = (typeof verificationMethodValues)[number];

export const domainVerifications = pgTable("domain_verifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  anchorId: uuid("anchor_id")
    .notNull()
    .references(() => anchors.id),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  verificationToken: text("verification_token").notNull(),
  method: text("method").$type<VerificationMethod>().notNull(),
  verifiedAt: timestamp("verified_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type DomainVerification = typeof domainVerifications.$inferSelect;
export type NewDomainVerification = typeof domainVerifications.$inferInsert;
