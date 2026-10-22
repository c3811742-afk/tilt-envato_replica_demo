import { vars } from '@/shared/theme';
import type { PageProps } from './Page.types';

export const pageDefaults: Required<Pick<PageProps, 'gap' | 'contentMaxWidth' | 'centered'>> = {
  gap: vars.spacing[7],
  contentMaxWidth: vars.sizes.container.maxWidth,
  centered: false,
};
