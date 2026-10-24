import type { ReactNode } from 'react';
import type { Theme } from '@/shared/theme';

export type TextVariant = keyof Theme['typography']['textStyles'];
export type TextElement = 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'label' | 'div' | 'dt' | 'dd' | 'strong';

export interface TextProps {
  children?: ReactNode;
  as?: TextElement;
  variant?: TextVariant;
  color?: string;
  align?: 'start' | 'center' | 'end';
  autoDirection?: boolean; // for user-generated text that may be in either language
  maxLines?: number; // cut long text after this many lines with an ellipsis
  id?: string;
  htmlFor?: string; // when rendered as a <label>
}
