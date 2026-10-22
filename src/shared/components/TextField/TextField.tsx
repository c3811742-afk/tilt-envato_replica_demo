import { useId } from 'react';
import { vars } from '@/shared/theme';
import { cx, withDefaults } from '@/shared/utils';
import { FieldMessage } from '../FieldMessage';
import { Stack } from '../Stack';
import { Text } from '../Text';
import { textFieldDefaults } from './TextField.defaults';
import type { TextFieldProps } from './TextField.types';
import styles from './TextField.module.css';

// A labelled text input with a hint, and an error message next to the field when validation fails.
export const TextField = (props: TextFieldProps) => {
  const {
    label,
    value,
    onChange,
    id,
    name,
    type,
    inputMode,
    placeholder,
    hint,
    error,
    prefix,
    endAction,
    direction,
    maxLength,
    min,
    max,
    disabled,
    required,
    autoFocus,
    autoComplete,
  } = withDefaults(textFieldDefaults, props);
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const messageId = `${inputId}-message`;
  const message = error ?? hint;

  return (
    <Stack gap={vars.spacing[2]}>
      {label && (
        <Text as="label" htmlFor={inputId} variant="title">
          {label}
        </Text>
      )}
      <div className={cx(styles.control, error && styles.invalid, disabled && styles.disabled)} dir={direction}>
        {prefix && (
          <span className={styles.prefix} aria-hidden="true">
            {prefix}
          </span>
        )}
        <input
          id={inputId}
          name={name}
          type={type}
          inputMode={inputMode}
          className={styles.input}
          value={value}
          onChange={(event) => onChange?.(event.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          min={min}
          max={max}
          disabled={disabled}
          required={required}
          autoFocus={autoFocus}
          autoComplete={autoComplete}
          dir={direction}
          aria-invalid={error ? true : undefined}
          aria-describedby={message ? messageId : undefined}
        />
        {endAction}
      </div>
      <FieldMessage id={messageId} message={message} tone={error ? 'error' : 'hint'} />
    </Stack>
  );
};
