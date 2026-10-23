import { vars } from '@/shared/theme';
import type { TabsProps } from './Tabs.types';

export const tabsDefaults: Required<Pick<TabsProps<string>, 'tabs' | 'gap'>> = {
  tabs: [],
  gap: vars.spacing[4],
};
