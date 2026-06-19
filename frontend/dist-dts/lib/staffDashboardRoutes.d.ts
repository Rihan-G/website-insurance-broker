/**
 * Dashboard path segments (first part after `/dashboard/`) that must never be
 * shown to a signed-in **client** account — even if someone bookmarks a staff URL.
 * Admin-only segments are included so clients never see an empty audit screen, etc.
 * Keep in sync with `App.tsx` routes that use `RoleGuard` for staff/admin.
 */
export declare const STAFF_DASHBOARD_SEGMENTS: Set<string>;
/** Segments that belong on the client portal host when using a split deploy. */
export declare const CLIENT_ONLY_DASHBOARD_SEGMENTS: Set<string>;
/** True when `pathname` is under `/dashboard/…` and the segment is staff-only. */
export declare function isStaffDashboardPath(pathname: string): boolean;
/** True for routes like `/dashboard/my-policies` that should open on the client portal host. */
export declare function isClientOnlyDashboardPath(pathname: string): boolean;
