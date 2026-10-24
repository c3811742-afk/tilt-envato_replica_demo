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
    rows,
    min,
    max,
    disabled,
    required,
    autoFocus,
    autoComplete,
    lang,
    hideLabel,
  } = withDefaults(textFieldDefaults, props);
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const messageId = `${inputId}-message`;
  const message = error ?? hint;
  // What the one-line input and the multi-line field have in common.
  const fieldProps = {
    id: inputId,
    name,
    value,
    placeholder,
    maxLength,
    disabled,
    required,
    autoFocus,
    autoComplete,
    dir: direction,
    lang,
    'aria-label': hideLabel ? label : undefined,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': message ? messageId : undefined,
  };

  return (
    <Stack gap={vars.spacing[2]}>
      {label && !hideLabel && (
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
        {rows > 1 ? (
          <textarea {...fieldProps} className={cx(styles.input, styles.multiline)} rows={rows} onChange={(event) => onChange?.(event.target.value)} />
        ) : (
          <input
            {...fieldProps}
            className={styles.input}
            type={type}
            inputMode={inputMode}
            min={min}
            max={max}
            onChange={(event) => onChange?.(event.target.value)}
          />
        )}
        {endAction && <span className={styles.endAction}>{endAction}</span>}
      </div>
      <FieldMessage id={messageId} message={message} tone={error ? 'error' : 'hint'} />
    </Stack>
  );
};
