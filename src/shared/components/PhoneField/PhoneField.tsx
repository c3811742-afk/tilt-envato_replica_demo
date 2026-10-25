import { useLocale } from '@/shared/hooks';
import { withDefaults } from '@/shared/utils';
import { TextField } from '../TextField';
import { phoneFieldDefaults } from './PhoneField.defaults';
import type { PhoneFieldProps } from './PhoneField.types';

// An Egyptian mobile number input: +20 in front, phone keypad, an example number as placeholder.
export const PhoneField = (props: PhoneFieldProps) => {
  const resolved = withDefaults(phoneFieldDefaults, props);
  const { text } = useLocale();
  return (
    <TextField
      {...resolved}
      label={resolved.label ?? text.profile.phone}
      placeholder={resolved.placeholder ?? text.profile.phonePlaceholder}
      type="tel"
      inputMode="tel"
    />
  );
};
