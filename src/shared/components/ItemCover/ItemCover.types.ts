import type { IconName } from '@/shared/assets';
import type { AccentName, PreviewFont } from '@/shared/theme';

export interface ItemCoverProps {
  image?: string; // preview image URL; without one, the generated cover (accent, shape, icon) is shown
  accent?: AccentName; // background color, with readable text on it
  icon?: IconName; // usually the item's category icon
  title?: string; // printed on the cover when `showTitle` is on
  showTitle?: boolean;
  seed?: string; // picks the decorative shape, so the same item always gets the same cover
  aspectRatio?: string;
  label?: string; // accessible description; without it the cover is decorative
  sample?: { family: PreviewFont; text: string }; // a font item: its letters in the font instead of an image
  previewOnHover?: boolean; // video items: the picture slowly moves while the pointer is over it
  fill?: boolean; // fill the height of its container instead of keeping `aspectRatio` (e.g. an item card)
}
