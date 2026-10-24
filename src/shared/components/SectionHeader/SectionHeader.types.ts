import type { ReactNode } from 'react';
import type { TextVariant } from '../Text';

export interface SectionHeaderProps {
  actions?: ReactNode; // buttons or badges at the end of the header, e.g. on an admin page
  autoDirection?: boolean; // the title is user content that may be in either language
  title?: string;
  subtitle?: string;
  as?: 'h1' | 'h2' | 'h3';
  variant?: TextVariant;
  actionLabel?: string; // e.g. "View all"
  actionTo?: string; // app path the action links to
  children?: ReactNode; // extra content under the subtitle (e.g. a result count)
}
