import * as React from 'react';

/**
 * ParticleField — from frontend@0.1.0.
 */
export interface ParticleFieldProps {
  count?: number;
  variant?: "rise" | "drift";
  className?: string;
  /** Shorter duration range for gentler but visible motion */
  pace?: "default" | "brisk";
}

export declare const ParticleField: React.ComponentType<ParticleFieldProps>;
