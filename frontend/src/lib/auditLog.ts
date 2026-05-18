import { db } from "./db";

/** Best-effort audit row; fails silently when offline, RLS denies, or demo mode. */
export async function insertAuditLog(input: {
  userId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  details?: Record<string, unknown>;
}): Promise<void> {
  const { error } = await db.auditLogs().insert({
    user_id: input.userId,
    action: input.action,
    resource_type: input.resourceType,
    resource_id: input.resourceId,
    details: input.details ?? null,
  });
  if (error) {
    console.warn("[audit_logs]", error.message);
  }
}
