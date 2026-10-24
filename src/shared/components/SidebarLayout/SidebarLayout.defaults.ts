import { vars } from '@/shared/theme';
import type { SidebarLayoutProps } from './SidebarLayout.types';

export const sidebarLayoutDefaults: Required<
  Pick<SidebarLayoutProps, 'width' | 'phoneToggleIcon' | 'background' | 'color' | 'stickyTop' | 'reachFooter' | 'collapsed' | 'collapsedWidth'>
> = {
  width: vars.sizes.sidebar.width,
  phoneToggleIcon: 'list',
  background: vars.colors.surface,
  color: vars.colors.text,
  stickyTop: vars.sizes.header.totalHeight, // the site's top bar and its row of links
  reachFooter: true,
  collapsed: false,
  collapsedWidth: vars.sizes.sidebar.collapsedWidth,
};
