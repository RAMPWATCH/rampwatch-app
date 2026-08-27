import type { Database } from "../client";
import { adminAuditLog } from "../schema";

export async function logAdminAction(
  db: Database,
  params: {
    adminUserId: string;
    action: string;
    targetType?: string;
    targetId?: string;
    detail?: Record<string, unknown>;
  }
): Promise<void> {
  await db.insert(adminAuditLog).values({
    adminUserId: params.adminUserId,
    action: params.action,
    targetType: params.targetType,
    targetId: params.targetId,
    detail: params.detail ? JSON.stringify(params.detail) : undefined,
    createdAt: new Date(),
  });
}
