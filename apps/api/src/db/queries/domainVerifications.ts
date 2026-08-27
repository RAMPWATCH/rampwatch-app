import { and, desc, eq, isNull } from "drizzle-orm";
import type { Database } from "../client";
import {
  anchors,
  domainVerifications,
  type Anchor,
  type DomainVerification,
  type Network,
  type VerificationMethod,
} from "../schema";
import { generateVerificationToken } from "../../lib/domainVerification";

function slugify(domain: string): string {
  return domain.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export interface StartClaimParams {
  userId: string;
  domain: string;
  network: Network;
  method: VerificationMethod;
}

export type StartClaimResult =
  | { ok: true; anchor: Anchor; verification: DomainVerification }
  | { ok: false; error: string };

/** Finds-or-creates the anchor for `domain`, then opens a new verification attempt. */
export async function startClaim(
  db: Database,
  { userId, domain, network, method }: StartClaimParams,
): Promise<StartClaimResult> {
  const normalizedDomain = domain.trim().toLowerCase();

  let [anchor] = await db.select().from(anchors).where(eq(anchors.domain, normalizedDomain));

  if (anchor && anchor.claimStatus === "claimed") {
    if (anchor.claimedByUserId === userId) {
      return { ok: false, error: "you have already claimed this anchor" };
    }
    return { ok: false, error: "this anchor has already been claimed by another operator" };
  }

  if (!anchor) {
    const slug = slugify(normalizedDomain) || crypto.randomUUID();
    [anchor] = await db
      .insert(anchors)
      .values({ slug, domain: normalizedDomain, network, claimStatus: "pending" })
      .returning();
  } else {
    [anchor] = await db
      .update(anchors)
      .set({ claimStatus: "pending" })
      .where(eq(anchors.id, anchor.id))
      .returning();
  }
  if (!anchor) {
    return { ok: false, error: "failed to create anchor record" };
  }

  const [verification] = await db
    .insert(domainVerifications)
    .values({
      anchorId: anchor.id,
      userId,
      verificationToken: generateVerificationToken(),
      method,
    })
    .returning();
  if (!verification) {
    return { ok: false, error: "failed to start verification" };
  }

  return { ok: true, anchor, verification };
}

/** The most recent not-yet-verified attempt this user opened for this anchor. */
export function getPendingVerification(
  db: Database,
  anchorId: string,
  userId: string,
): Promise<DomainVerification | undefined> {
  return db
    .select()
    .from(domainVerifications)
    .where(
      and(
        eq(domainVerifications.anchorId, anchorId),
        eq(domainVerifications.userId, userId),
        isNull(domainVerifications.verifiedAt),
      ),
    )
    .orderBy(desc(domainVerifications.createdAt))
    .then((rows) => rows[0]);
}

export async function markVerified(
  db: Database,
  { anchorId, userId, verificationId }: { anchorId: string; userId: string; verificationId: string },
): Promise<void> {
  await db
    .update(domainVerifications)
    .set({ verifiedAt: new Date() })
    .where(eq(domainVerifications.id, verificationId));
  await db
    .update(anchors)
    .set({ claimStatus: "claimed", claimedByUserId: userId })
    .where(eq(anchors.id, anchorId));
}
