import "dotenv/config";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsFolder = path.join(dirname, "migrations");

async function run(): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL;

  if (databaseUrl) {
    const { drizzle } = await import("drizzle-orm/node-postgres");
    const { migrate } = await import("drizzle-orm/node-postgres/migrator");
    const { Pool } = await import("pg");
    const pool = new Pool({ connectionString: databaseUrl });
    try {
      const db = drizzle(pool);
      await migrate(db, { migrationsFolder });
      console.log("migrations applied (postgres)");
    } catch (error) {
      console.error("migration failed:", error);
      process.exitCode = 1;
    } finally {
      await pool.end();
    }
    return;
  }

  const { drizzle } = await import("drizzle-orm/pglite");
  const { migrate } = await import("drizzle-orm/pglite/migrator");
  const { PGlite } = await import("@electric-sql/pglite");
  const fs = await import("node:fs");
  const dataDir = process.env.PGLITE_DATA_DIR ?? ".pglite/rampwatch-dev";
  fs.mkdirSync(dataDir, { recursive: true });
  const client = new PGlite(dataDir);
  try {
    const db = drizzle(client);
    await migrate(db, { migrationsFolder });
    console.log(`migrations applied (pglite: ${dataDir})`);
  } catch (error) {
    console.error("migration failed:", error);
    process.exitCode = 1;
  } finally {
    await client.close();
  }
}

run();
