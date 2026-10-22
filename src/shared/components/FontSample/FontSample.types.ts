import type { TextAlignment } from '@/shared/constants';
import type { PreviewFont } from '@/shared/theme';

export interface FontSampleProps {
  family?: PreviewFont; // without one, the interface font is used
  text?: string;
  size?: string;
  align?: TextAlignment;
  color?: string;
  maxLines?: number; // cut long samples after this many lines
}
