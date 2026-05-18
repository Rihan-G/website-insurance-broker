/**
 * Dashboard path segments (first part after `/dashboard/`) that must never be
 * shown to a signed-in **client** account — even if someone bookmarks a staff URL.
 * Admin-only segments are included so clients never see an empty audit screen, etc.
 * Keep in sync with `App.tsx` routes that use `RoleGuard` for staff/admin.
 */
export const STAFF_DASHBOARD_SEGMENTS = new Set([
  "clients",
  "review",
  "audit",
  "analytics",
  "whatsapp",
  "compliance",
  "capacity",
  "commissions",
  "tasks",
  "operations-calendar",
  "broker-client-site",
]);

/** Segments that belong on the client portal host when using a split deploy. */
export const CLIENT_ONLY_DASHBOARD_SEGMENTS = new Set(["my-policies"]);

/** True when `pathname` is under `/dashboard/…` and the segment is staff-only. */
export function isStaffDashboardPath(pathname: string): boolean {
  const m = pathname.match(/^\/dashboard\/([^/?]+)/);
  const seg = m?.[1];
  return Boolean(seg && STAFF_DASHBOARD_SEGMENTS.has(seg));
}

/** True for routes like `/dashboard/my-policies` that should open on the client portal host. */
export function isClientOnlyDashboardPath(pathname: string): boolean {
  const m = pathname.match(/^\/dashboard\/([^/?]+)/);
  const seg = m?.[1];
  return Boolean(seg && CLIENT_ONLY_DASHBOARD_SEGMENTS.has(seg));
}
