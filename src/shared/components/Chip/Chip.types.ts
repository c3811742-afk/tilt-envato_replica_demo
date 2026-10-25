import type { ReactNode } from 'react';
import type { IconName } from '@/shared/assets';

export interface ChipProps {
  children?: ReactNode;
  to?: string; // app path (from routes.ts): the chip is a link
  onClick?: () => void; // used when there is no `to`
  selected?: boolean;
  icon?: IconName;
  background?: string; // background when not selected
  color?: string; // text color when not selected
  radius?: string;
}
