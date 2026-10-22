import { useId } from 'react';
import { vars } from '@/shared/theme';
import { withDefaults } from '@/shared/utils';
import { FieldMessage } from '../FieldMessage';
import { Stack } from '../Stack';
import { Text } from '../Text';
import { checkboxDefaults } from './Checkbox.defaults';
import type { CheckboxProps } from './Checkbox.types';
import styles from './Checkbox.module.css';

// A native checkbox with its label, and an error under it when it must be checked.
export const Checkbox = (props: CheckboxProps) => {
  const { label, checked, onChange, error, id, disabled } = withDefaults(checkboxDefaults, props);
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;

  return (
    <Stack gap={vars.spacing[1]}>
      <div className={styles.row}>
        <input
          id={inputId}
          type="checkbox"
          className={styles.box}
          checked={checked}
          disabled={disabled}
          onChange={(event) => onChange?.(event.target.checked)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
        />
        <Text as="label" htmlFor={inputId} variant="bodySm">
          {label}
        </Text>
      </div>
      <FieldMessage id={errorId} message={error} tone="error" />
    </Stack>
  );
};
