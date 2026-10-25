import type { ReactNode } from 'react';

export interface TopBarProps {
  homeTo?: string; // where the TILT logo leads; defaults to the site's home page
  homeLabel?: string; // the logo link's accessible name; defaults to "TILT home"
  tag?: ReactNode; // shown after the logo, e.g. the admin area's "Admin" badge
  search?: ReactNode; // the middle of the bar, from tablet width up (phones search elsewhere)
  actions?: ReactNode; // the end of the bar: menus and account buttons
  below?: ReactNode; // a second row under the bar from tablet width up (e.g. the site's links)
  accentColor?: string; // the line under the bar
  accentWidth?: string;
  contained?: boolean; // the bar's content keeps the page width; off: it spans the screen (the admin)
}
