import * as React from 'react';

/**
 * ThemeToggle — from frontend@0.1.0.
 */
export interface ThemeToggleProps {
  /** When set, used for layout classes (e.g. nav on dark hero) */
  variant?: "default" | "onDark";
  className?: string;
}

export declare const ThemeToggle: React.ComponentType<ThemeToggleProps>;
