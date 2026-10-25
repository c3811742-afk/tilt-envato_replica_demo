import type { SectionHeaderProps } from '../SectionHeader';

export interface SectionProps extends SectionHeaderProps {
  gap?: string; // space between the header and each child
  ariaLabel?: string; // accessible name when the section has no title
}
