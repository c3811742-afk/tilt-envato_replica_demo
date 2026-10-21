import { useId } from 'react';
import { withDefaults } from '@/shared/utils';
import { Field, fieldControlClassName, fieldDescribedBy } from '../Field';
import { selectFieldDefaults } from './SelectField.defaults';
import type { SelectFieldProps } from './SelectField.types';

// A labelled dropdown. Styled by Field's shared control class, so it has no CSS module of its own.
export const SelectField = (props: SelectFieldProps) => {
  const { label, options, value, onChange, placeholder, hint, error, required, disabled, hideLabel } = withDefaults(
    selectFieldDefaults,
    props,
  );
  const id = useId();

  return (
    <Field id={id} label={label} hint={hint} error={error} hideLabel={hideLabel}>
      <select
        id={id}
        className={fieldControlClassName}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange?.(event.target.value)}
        aria-label={hideLabel ? label : undefined}
        aria-required={required || undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={fieldDescribedBy(id, hint, error)}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </Field>
  );
};
