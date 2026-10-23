import { useState } from 'react';
import { useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { withDefaults } from '@/shared/utils';
import { Icon } from '../Icon';
import { TextField } from '../TextField';
import { passwordFieldDefaults } from './PasswordField.defaults';
import type { PasswordFieldProps } from './PasswordField.types';
import styles from './PasswordField.module.css';

// A password input with a button to show or hide what was typed.
export const PasswordField = (props: PasswordFieldProps) => {
  const resolved = withDefaults(passwordFieldDefaults, props);
  const { text } = useLocale();
  const [visible, setVisible] = useState(false);

  return (
    <TextField
      {...resolved}
      type={visible ? 'text' : 'password'}
      endAction={
        <button
          type="button"
          className={styles.toggle}
          aria-label={visible ? text.auth.hidePassword : text.auth.showPassword}
          aria-pressed={visible}
          onClick={() => setVisible((current) => !current)}
        >
          <Icon name={visible ? 'eyeOff' : 'eye'} size={vars.sizes.icon.sm} />
        </button>
      }
    />
  );
};
