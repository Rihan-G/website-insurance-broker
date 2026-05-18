import { db } from "./db";

export type AuditAction =
  | "document.uploaded"
  | "document.ingest_completed"
  | "document.ingest_failed"
  | "document.reviewed"
  | "document.approved"
  | "document.rejected"
  | "client.created"
  | "client.updated"
  | "payment.created"
  | "payment.paid"
  | "policy.created"
  | "policy.renewed"
  | "user.login"
  | "user.logout"
  | "user.2fa_enabled"
  | "settings.updated"
  | "quote.created"
  | "quote.accepted";

export async function logAudit(
  userId: string,
  action: AuditAction,
  resourceType: string,
  resourceId: string,
  details?: Record<string, unknown>
) {
  try {
    await db.auditLogs().insert({
      user_id: userId,
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      details: details ?? null,
    });
  } catch {
    // Silently fail — audit logging should never break the main flow
  }
}

export async function fetchAuditLogs(limit = 100) {
  const { data, error } = await db.auditLogs()
    .select("*, profiles(full_name, email, role)")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return data;
}
