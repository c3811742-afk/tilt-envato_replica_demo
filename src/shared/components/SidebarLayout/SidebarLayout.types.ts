import type { ReactNode } from 'react';
import type { IconName } from '@/shared/assets';

export interface SidebarLayoutProps {
  sidebar?: ReactNode; // the docked panel
  children?: ReactNode; // the page next to it
  label?: string; // accessible name of the panel (e.g. "Filters")
  width?: string; // of the panel
  // Phones and tablets: the panel opens under a button above the page, and closes again on the next page.
  phoneToggleLabel?: string; // the button's text, e.g. "Menu" or "Filters (2)"
  phoneToggleIcon?: IconName;
  phoneToggleTour?: string; // the site tour's name for the button (data-tour), so the tour can point at it
  background?: string; // the panel's background, e.g. the admin's blue
  color?: string; // its text color on that background
  stickyTop?: string; // how far under the top of the screen the panel stays (the top bar's height)
  reachFooter?: boolean; // the panel runs down to the site's footer (off where there is none, e.g. the admin)
  // Folding: pass both to let the user fold the panel down to a slim strip with a button that opens it again.
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  collapseLabel?: string; // the fold button's accessible name (e.g. "Hide filters")
  expandLabel?: string; // the open button's accessible name (e.g. "Show filters")
  collapsedWidth?: string; // of the folded strip
}
