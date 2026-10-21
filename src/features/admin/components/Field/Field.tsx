import { useId, type CSSProperties } from 'react';
import { withDefaults } from '@/shared/utils';
import { fieldDefaults } from './Field.defaults';
import { fieldDescribedBy, fieldErrorId, fieldHintId } from './Field.helpers';
import type { FieldProps } from './Field.types';
import styles from './Field.module.css';

// Label, hint and error around a form control. Used by TextField, SelectField and checkbox groups.
export const Field = (props: FieldProps) => {
  const { label, id: controlId, children, hint, error, hideLabel, group, gap } = withDefaults(fieldDefaults, props);
  const fallbackId = useId();
  const id = controlId ?? fallbackId;
  const style = { '--field-gap': gap } as CSSProperties;

  const messages = (
    <>
      {hint && (
        <p id={fieldHintId(id)} className={styles.hint}>
          {hint}
        </p>
      )}
      {error && (
        <p id={fieldErrorId(id)} className={styles.error}>
          {error}
        </p>
      )}
    </>
  );

  if (group) {
    return (
      <fieldset className={styles.field} style={style} aria-describedby={fieldDescribedBy(id, hint, error)}>
        <legend className={styles.label}>{label}</legend>
        {children}
        {messages}
      </fieldset>
    );
  }

  return (
    <div className={styles.field} style={style}>
      {!hideLabel && (
        <label htmlFor={id} className={styles.label}>
          {label}
        </label>
      )}
      {children}
      {messages}
    </div>
  );
};
