import * as React from 'react';

/**
 * RoleGuard — from frontend@0.1.0.
 */
export interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: ("admin" | "broker" | "client")[];
  fallback?: string;
}

export declare const RoleGuard: React.ComponentType<RoleGuardProps>;
