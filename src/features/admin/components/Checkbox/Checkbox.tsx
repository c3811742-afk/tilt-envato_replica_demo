import { useId, type CSSProperties } from 'react';
import { Text } from '@/shared/components';
import { vars } from '@/shared/theme';
import { withDefaults } from '@/shared/utils';
import { checkboxDefaults } from './Checkbox.defaults';
import type { CheckboxProps } from './Checkbox.types';
import styles from './Checkbox.module.css';

// A tick box with its label. The whole row is clickable.
export const Checkbox = (props: CheckboxProps) => {
  const { label, checked, onChange, description, disabled, color, hideLabel } = withDefaults(checkboxDefaults, props);
  const id = useId();
  const style = { '--checkbox-color': color } as CSSProperties;

  return (
    <label htmlFor={id} className={styles.checkbox} style={style}>
      <input
        id={id}
        type="checkbox"
        className={styles.input}
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange?.(event.target.checked)}
        aria-label={hideLabel ? label : undefined}
      />
      {!hideLabel && (
        <span className={styles.text}>
          <Text as="span">{label}</Text>
          {description && (
            <Text as="span" variant="bodySm" color={vars.colors.textMuted}>
              {description}
            </Text>
          )}
        </span>
      )}
    </label>
  );
};
