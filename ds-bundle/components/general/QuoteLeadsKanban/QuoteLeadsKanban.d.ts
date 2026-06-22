import * as React from 'react';

/**
 * QuoteLeadsKanban — from frontend@0.1.0.
 */
export interface QuoteLeadsKanbanProps {
  rows: QuoteLeadRow[];
  updatingId: string;
  onStatusChange: (id: string, next: QuoteStatus) => void;
}

export declare const QuoteLeadsKanban: React.ComponentType<QuoteLeadsKanbanProps>;
