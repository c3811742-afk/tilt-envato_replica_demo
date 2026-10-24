import type { ReactNode } from 'react';

export interface SplitLayoutProps {
  main?: ReactNode;
  aside?: ReactNode; // stays in view while the main column scrolls (desktop)
  columns?: string; // desktop column widths, in the order they're shown
  gap?: string;
  stickyAside?: boolean;
  asideAt?: 'start' | 'end'; // which side the panel is on (e.g. search filters at the start)
}
