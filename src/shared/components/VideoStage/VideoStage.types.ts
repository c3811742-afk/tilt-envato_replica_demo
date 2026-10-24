import type { IconName } from '@/shared/assets';
import type { AccentName } from '@/shared/theme';

export interface VideoStageProps {
  image?: string; // the picture the preview moves over; without one, the generated cover is used
  accent?: AccentName;
  icon?: IconName;
  seed?: string;
  progress?: number; // 0-1 through the preview
  title?: string; // a template's title, animated in and out over the picture
  caption?: string; // a tutorial step, shown at the bottom
  step?: string; // "Step 2 of 5"
  aspectRatio?: string;
}
