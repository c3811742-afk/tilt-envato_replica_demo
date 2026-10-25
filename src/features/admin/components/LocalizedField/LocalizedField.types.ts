import type { LocalizedText } from '@/features/admin/types';
import type { Locale } from '@/shared/theme';

export interface LocalizedFieldProps {
  label: string; // e.g. "Category name"
  value?: LocalizedText;
  onChange?: (value: LocalizedText) => void;
  multiline?: boolean;
  hint?: string;
  errors?: Partial<Record<Locale, string>>; // shown under the English or the Arabic box
  required?: boolean;
}
