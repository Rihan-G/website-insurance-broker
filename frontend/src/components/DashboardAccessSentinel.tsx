import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { CrossPortalNavigate } from "./CrossPortalNavigate";
import { clientPortalBaseUrl, getPortalFlavor, staffPortalBaseUrl } from "../lib/portalFlavor";
import { isClientOnlyDashboardPath, isStaffDashboardPath } from "../lib/staffDashboardRoutes";

function safeSameOriginSuffix(pathname: string, search: string, hash: string): string {
  if (!pathname.startsWith("/")) return "/dashboard";
  return pathname + search + hash;
}

/**
 * - **Unified** (default): clients cannot open staff dashboard segments (same origin).
 * - **Client portal host**: any signed-in user hitting a staff URL is sent to `VITE_STAFF_PORTAL_URL` + path when set.
 * - **Staff portal host**: anyone hitting a client-only segment (e.g. my-policies) is sent to `VITE_CLIENT_PORTAL_URL` + path when set.
 */
export function DashboardAccessSentinel({ children }: { children: React.ReactNode }) {
  const { profile, loading } = useAuth();
  const { pathname, search, hash } = useLocation();
  const flavor = getPortalFlavor();
  const suffix = safeSameOriginSuffix(pathname, search, hash);

  if (loading || !profile) return <>{children}</>;

  if (flavor === "client" && isStaffDashboardPath(pathname)) {
    const staff = staffPortalBaseUrl();
    if (staff) return <CrossPortalNavigate href={`${staff}${suffix}`} />;
    return <Navigate to="/dashboard" replace />;
  }

  if (flavor === "staff" && isClientOnlyDashboardPath(pathname)) {
    const client = clientPortalBaseUrl();
    if (client) return <CrossPortalNavigate href={`${client}${suffix}`} />;
    return <Navigate to="/dashboard" replace />;
  }

  if (flavor === "unified" && profile.role === "client" && isStaffDashboardPath(pathname)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
