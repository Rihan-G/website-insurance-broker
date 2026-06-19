import * as React from 'react';

/**
 * EmptyState — from frontend@0.1.0.
 */
export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionTo?: string;
  onAction?: () => void;
}

export declare const EmptyState: React.ComponentType<EmptyStateProps>;
