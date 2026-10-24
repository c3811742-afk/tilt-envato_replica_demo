import type { ReactNode } from 'react';

export interface SplitLayoutProps {
  main?: ReactNode;
  aside?: ReactNode; // stays in view while the main column scrolls (desktop)
  columns?: string; // desktop column widths, in the order they're shown
  gap?: string;
  stickyAside?: boolean;
  scrollAside?: boolean; // a sticky panel taller than the screen scrolls on its own (e.g. a long filter list)
  asideAt?: 'start' | 'end'; // which side the panel is on (e.g. search filters at the start)
}
