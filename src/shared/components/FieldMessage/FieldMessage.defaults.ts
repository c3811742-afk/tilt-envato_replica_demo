import { vars } from '@/shared/theme';
import type { FieldMessageProps, FieldMessageTone } from './FieldMessage.types';

export const fieldMessageColors: Record<FieldMessageTone, string> = {
  hint: vars.colors.textMuted,
  error: vars.colors.danger,
};

export const fieldMessageDefaults: Required<Pick<FieldMessageProps, 'tone'>> = {
  tone: 'hint',
};
