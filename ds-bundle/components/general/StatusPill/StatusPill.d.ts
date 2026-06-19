import * as React from 'react';

/**
 * StatusPill — from frontend@0.1.0.
 */
export interface StatusPillProps {
  label: string;
  tone?: "neutral" | "success" | "warning" | "danger" | "info";
  icon?: React.ReactNode;
}

export declare const StatusPill: React.ComponentType<StatusPillProps>;
