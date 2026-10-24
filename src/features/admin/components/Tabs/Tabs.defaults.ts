import { vars } from '@/shared/theme';
import type { TabsProps } from './Tabs.types';

export const tabsDefaults: Required<Pick<TabsProps<string>, 'gap'>> = {
  gap: vars.spacing[5],
};
