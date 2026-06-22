import * as React from 'react';

/**
 * KineticHeading — from frontend@0.1.0.
 */
export interface KineticHeadingProps {
  text: string;
  className?: string;
  highlightWords?: string[];
  delay?: number;
}

export declare const KineticHeading: React.ComponentType<KineticHeadingProps>;
