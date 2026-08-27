import { eq } from "drizzle-orm";
import type { Database } from "../client";
import { providers, type Provider } from "../schema";

export interface CreateProviderParams {
  userId: string;
  stellarAddress: string;
  displayName: string;
  verificationTier: string;
  status: string;
}

export async function createProvider(
  db: Database,
  params: CreateProviderParams
): Promise<Provider> {
  const [provider] = await db
    .insert(providers)
    .values({
      userId: params.userId,
      stellarAddress: params.stellarAddress,
      displayName: params.displayName,
      verificationTier: params.verificationTier,
      status: params.status,
      createdAt: new Date(),
    })
    .returning();

  if (!provider) {
    throw new Error("insert into providers returned no row");
  }

  return provider;
}

export function findProviderById(db: Database, id: string): Promise<Provider | undefined> {
  return db
    .select()
    .from(providers)
    .where(eq(providers.id, id))
    .then((rows) => rows[0]);
}

export function findProviderByAddress(
  db: Database,
  stellarAddress: string
): Promise<Provider | undefined> {
  return db
    .select()
    .from(providers)
    .where(eq(providers.stellarAddress, stellarAddress))
    .then((rows) => rows[0]);
}

export function findProvidersByUserId(db: Database, userId: string): Promise<Provider[]> {
  return db
    .select()
    .from(providers)
    .where(eq(providers.userId, userId));
}

export async function updateProviderTier(
  db: Database,
  providerId: string,
  tier: string
): Promise<Provider | undefined> {
  const [provider] = await db
    .update(providers)
    .set({ verificationTier: tier })
    .where(eq(providers.id, providerId))
    .returning();

  return provider;
}

export async function suspendProvider(
  db: Database,
  providerId: string
): Promise<Provider | undefined> {
  const [provider] = await db
    .update(providers)
    .set({ status: "suspended" })
    .where(eq(providers.id, providerId))
    .returning();

  return provider;
}
