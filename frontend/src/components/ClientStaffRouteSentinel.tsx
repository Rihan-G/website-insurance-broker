import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { isStaffDashboardPath } from "../lib/staffDashboardRoutes";

/**
 * Redirects signed-in **clients** away from staff dashboard URLs so they never
 * briefly render staff pages (and cannot use deep links to probe staff UI).
 * Staff sessions remain one-per-browser via Supabase; this is layout-level RBAC.
 */
export function ClientStaffRouteSentinel({ children }: { children: React.ReactNode }) {
  const { profile, loading } = useAuth();
  const { pathname } = useLocation();

  if (loading || !profile) return <>{children}</>;

  if (profile.role === "client" && isStaffDashboardPath(pathname)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
