import * as schema from "./schema/index";

export type Database =
  | Awaited<ReturnType<typeof createPgDatabase>>
  | Awaited<ReturnType<typeof createPgliteDatabase>>;

async function createPgDatabase(databaseUrl: string) {
  // Real Postgres path — used whenever DATABASE_URL is set (staging/prod,
  // or local dev once a real Postgres connection string is provided).
  const { drizzle } = await import("drizzle-orm/node-postgres");
  const { Pool } = await import("pg");
  const pool = new Pool({ connectionString: databaseUrl });
  return drizzle(pool, { schema });
}

async function createPgliteDatabase() {
  // Dev/test fallback when no DATABASE_URL is configured — an embedded,
  // Postgres-wire-compatible engine (@electric-sql/pglite). Schema/migrations
  // stay plain Postgres SQL either way; only this connection swaps at deploy.
  const { drizzle } = await import("drizzle-orm/pglite");
  const { PGlite } = await import("@electric-sql/pglite");
  const fs = await import("node:fs");
  const dataDir = process.env.PGLITE_DATA_DIR ?? ".pglite/rampwatch-dev";
  fs.mkdirSync(dataDir, { recursive: true });
  const client = new PGlite(dataDir);
  return drizzle(client, { schema });
}

let dbPromise: Promise<Database> | null = null;

export async function getDb(): Promise<Database> {
  if (!dbPromise) {
    const databaseUrl = process.env.DATABASE_URL;
    dbPromise = databaseUrl
      ? createPgDatabase(databaseUrl)
      : createPgliteDatabase();
  }
  return dbPromise;
}
