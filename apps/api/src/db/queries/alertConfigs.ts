import { and, eq } from "drizzle-orm";
import type { Database } from "../client";
import { alertConfigs, type AlertChannel, type AlertConfig } from "../schema";

export function listAlertsForAnchor(db: Database, anchorId: string): Promise<AlertConfig[]> {
  return db.select().from(alertConfigs).where(eq(alertConfigs.anchorId, anchorId));
}

export async function createAlert(
  db: Database,
  params: { anchorId: string; channel: AlertChannel; destination: string },
): Promise<AlertConfig> {
  const [alert] = await db.insert(alertConfigs).values(params).returning();
  if (!alert) {
    throw new Error("insert into alert_configs returned no row");
  }
  return alert;
}

export function findAlertForAnchor(
  db: Database,
  { id, anchorId }: { id: string; anchorId: string },
): Promise<AlertConfig | undefined> {
  return db
    .select()
    .from(alertConfigs)
    .where(and(eq(alertConfigs.id, id), eq(alertConfigs.anchorId, anchorId)))
    .then((rows) => rows[0]);
}

export async function updateAlert(
  db: Database,
  { id, anchorId, destination, isActive }: {
    id: string;
    anchorId: string;
    destination?: string;
    isActive?: boolean;
  },
): Promise<AlertConfig | undefined> {
  const patch: Partial<Pick<AlertConfig, "destination" | "isActive">> = {};
  if (destination !== undefined) patch.destination = destination;
  if (isActive !== undefined) patch.isActive = isActive;

  const [alert] = await db
    .update(alertConfigs)
    .set(patch)
    .where(and(eq(alertConfigs.id, id), eq(alertConfigs.anchorId, anchorId)))
    .returning();
  return alert;
}

export async function deleteAlert(
  db: Database,
  { id, anchorId }: { id: string; anchorId: string },
): Promise<boolean> {
  const deleted = await db
    .delete(alertConfigs)
    .where(and(eq(alertConfigs.id, id), eq(alertConfigs.anchorId, anchorId)))
    .returning();
  return deleted.length > 0;
}
