import { vars } from '@/shared/theme';
import type { SidebarLayoutProps } from './SidebarLayout.types';

export const sidebarLayoutDefaults: Required<Pick<SidebarLayoutProps, 'width' | 'collapsed' | 'collapsedWidth'>> = {
  width: vars.sizes.sidebar.width,
  collapsed: false,
  collapsedWidth: vars.sizes.sidebar.collapsedWidth,
};
