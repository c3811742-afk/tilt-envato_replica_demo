import { useId } from 'react';
import { cx, withDefaults } from '@/shared/utils';
import { Field, fieldControlClassName, fieldDescribedBy } from '../Field';
import { textFieldDefaults } from './TextField.defaults';
import type { TextFieldProps } from './TextField.types';
import styles from './TextField.module.css';

// A labelled text input, or a textarea with `multiline`.
export const TextField = (props: TextFieldProps) => {
  const {
    label,
    value,
    onChange,
    type,
    multiline,
    placeholder,
    hint,
    error,
    required,
    disabled,
    hideLabel,
    autoComplete,
    autoDirection,
  } = withDefaults(textFieldDefaults, props);
  const id = useId();

  const controlProps = {
    id,
    value,
    placeholder,
    disabled,
    autoComplete,
    dir: autoDirection ? 'auto' : undefined,
    'aria-label': hideLabel ? label : undefined,
    'aria-required': required || undefined,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': fieldDescribedBy(id, hint, error),
  } as const;

  return (
    <Field id={id} label={label} hint={hint} error={error} hideLabel={hideLabel}>
      {multiline ? (
        <textarea
          {...controlProps}
          className={cx(fieldControlClassName, styles.multiline)}
          onChange={(event) => onChange?.(event.target.value)}
        />
      ) : (
        <input
          {...controlProps}
          type={type}
          className={fieldControlClassName}
          onChange={(event) => onChange?.(event.target.value)}
        />
      )}
    </Field>
  );
};
