import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: Array<"admin" | "broker" | "client">;
  fallback?: string;
}

export function RoleGuard({ children, allowedRoles, fallback = "/dashboard" }: RoleGuardProps) {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  if (!profile || !allowedRoles.includes(profile.role)) {
    return <Navigate to={fallback} replace />;
  }

  return <>{children}</>;
}
