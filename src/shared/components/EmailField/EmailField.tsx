import { useLocale } from '@/shared/hooks';
import { withDefaults } from '@/shared/utils';
import { TextField } from '../TextField';
import { emailFieldDefaults } from './EmailField.defaults';
import type { EmailFieldProps } from './EmailField.types';

// An email input: email keyboard on phones, left to right, labelled "Email" unless told otherwise.
export const EmailField = (props: EmailFieldProps) => {
  const resolved = withDefaults(emailFieldDefaults, props);
  const { text } = useLocale();
  return <TextField {...resolved} label={resolved.label ?? text.auth.email} type="email" inputMode="email" />;
};
