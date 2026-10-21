import type { PageHeaderProps } from './PageHeader.types';

export const pageHeaderDefaults: Required<Pick<PageHeaderProps, 'titleVariant' | 'autoDirection'>> = {
  titleVariant: 'h2',
  autoDirection: false,
};
