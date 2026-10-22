import { useId } from 'react';
import { vars } from '@/shared/theme';
import { withDefaults } from '@/shared/utils';
import { Icon } from '../Icon';
import { Stack } from '../Stack';
import { Text } from '../Text';
import { selectDefaults } from './Select.defaults';
import type { SelectProps } from './Select.types';
import styles from './Select.module.css';

// A labelled native dropdown (keeps the phone's own picker on mobile).
export const Select = (props: SelectProps) => {
  const { label, value, options, onChange, id, disabled } = withDefaults(selectDefaults, props);
  const generatedId = useId();
  const selectId = id ?? generatedId;

  return (
    <Stack gap={vars.spacing[1]}>
      {label && (
        <Text as="label" htmlFor={selectId} variant="label" color={vars.colors.textMuted}>
          {label}
        </Text>
      )}
      <div className={styles.control}>
        <select
          id={selectId}
          className={styles.select}
          value={value}
          disabled={disabled}
          onChange={(event) => onChange?.(event.target.value)}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <span className={styles.chevron}>
          <Icon name="chevronDown" size={vars.sizes.icon.sm} />
        </span>
      </div>
    </Stack>
  );
};
