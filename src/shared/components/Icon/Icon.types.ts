import type { IconName } from '@/shared/assets';

export interface IconProps {
  name?: IconName;
  size?: string;
  color?: string; // defaults to the surrounding text color
  filled?: boolean; // fill the shape instead of drawing its outline (e.g. a rating star)
  flip?: boolean; // mirror in right-to-left languages; defaults to true for directional icons (arrows, chevrons)
  label?: string; // accessible name; without it the icon is decorative and hidden from screen readers
}
