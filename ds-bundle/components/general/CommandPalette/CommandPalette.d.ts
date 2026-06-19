import * as React from 'react';

/**
 * CommandPalette — from frontend@0.1.0.
 */
export interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export declare const CommandPalette: React.ComponentType<CommandPaletteProps>;
