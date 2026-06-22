import * as React from 'react';

/**
 * IncidentLocationMap — from frontend@0.1.0.
 */
export interface IncidentLocationMapProps {
  value: IncidentPin;
  onChange: (next: IncidentPin | null) => void;
}

export declare const IncidentLocationMap: React.ComponentType<IncidentLocationMapProps>;
