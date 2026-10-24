import { vars } from '@/shared/theme';
import type { DetailListProps } from './DetailList.types';

export const detailListDefaults: Required<Pick<DetailListProps, 'items' | 'gap'>> = {
  items: [],
  gap: vars.spacing[3],
};
