import { vars } from '@/shared/theme';
import type { StatCardProps } from './StatCard.types';

export const statCardDefaults: Required<Pick<StatCardProps, 'minHeight'>> = {
  minHeight: vars.sizes.statCard.minHeight,
};
