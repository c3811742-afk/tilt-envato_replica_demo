import type { IconName } from '@/shared/assets';

export interface IconNoteProps {
  icon?: IconName;
  title?: string;
  text?: string;
  background?: string;
  iconColor?: string;
  autoDirection?: boolean; // the title is user content that may be in either language
}
