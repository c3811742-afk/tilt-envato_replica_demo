import { vars } from '@/shared/theme';
import type { SplitLayoutProps } from './SplitLayout.types';

export const splitLayoutDefaults: Required<Pick<SplitLayoutProps, 'columns' | 'gap' | 'stickyAside' | 'scrollAside' | 'asideAt'>> = {
  columns: vars.sizes.splitLayout.columns,
  gap: vars.spacing[6],
  stickyAside: true,
  scrollAside: true,
  asideAt: 'end',
};
