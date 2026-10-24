import type { ReactNode } from 'react';

export interface SidebarLayoutProps {
  sidebar?: ReactNode; // the docked panel (desktop only)
  children?: ReactNode; // the page next to it
  label?: string; // accessible name of the panel (e.g. "Filters")
  width?: string; // of the panel
  // Folding: pass both to let the user fold the panel down to a slim strip with a button that opens it again.
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  collapseLabel?: string; // the fold button's accessible name (e.g. "Hide filters")
  expandLabel?: string; // the open button's accessible name (e.g. "Show filters")
  collapsedWidth?: string; // of the folded strip
}
