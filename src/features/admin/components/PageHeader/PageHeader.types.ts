import type { ReactNode } from 'react';
import type { TextVariant } from '@/shared/components';

export interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode; // buttons or badges shown at the end of the header
  titleVariant?: TextVariant;
  autoDirection?: boolean; // for titles written by users (e.g. an element title)
}
