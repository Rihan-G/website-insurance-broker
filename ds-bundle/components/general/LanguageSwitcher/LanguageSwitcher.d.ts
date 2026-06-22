import * as React from 'react';

/**
 * LanguageSwitcher — from frontend@0.1.0.
 */
export interface LanguageSwitcherProps {
  /** When set, used for layout classes (e.g. nav on dark hero) */
  variant?: "default" | "onDark";
  className?: string;
}

export declare const LanguageSwitcher: React.ComponentType<LanguageSwitcherProps>;
