import type { CSSProperties } from 'react';
import { vars } from '@/shared/theme';
import { cx, withDefaults } from '@/shared/utils';
import { Icon } from '../Icon';
import { Stack } from '../Stack';
import { Text } from '../Text';
import { optionCardGroupDefaults } from './OptionCardGroup.defaults';
import type { OptionCard, OptionCardGroupProps } from './OptionCardGroup.types';
import styles from './OptionCardGroup.module.css';

// Large selectable cards, one choice at a time (e.g. payment methods). The selected card shows `children` under it.
export const OptionCardGroup = <T extends string>(props: OptionCardGroupProps<T>) => {
  const resolved = withDefaults(optionCardGroupDefaults, props);
  const { label, value, onChange, children, selectedBorderColor, selectedBackground } = resolved;
  const options = resolved.options as OptionCard<T>[];

  const style = {
    '--option-selected-border': selectedBorderColor,
    '--option-selected-background': selectedBackground,
  } as CSSProperties;

  return (
    <div role="radiogroup" aria-label={label} style={style}>
      <Stack gap={vars.spacing[3]}>
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <div key={option.value} className={cx(styles.option, selected && styles.selected)}>
              <button
                type="button"
                role="radio"
                aria-checked={selected}
                disabled={option.disabled}
                className={styles.button}
                onClick={() => onChange?.(option.value)}
              >
                <span className={styles.radio} aria-hidden="true" />
                {option.icon && <Icon name={option.icon} />}
                <Stack gap={vars.spacing[1]}>
                  <Text as="span" variant="title">
                    {option.title}
                  </Text>
                  {(option.disabled ? option.disabledReason : option.description) && (
                    <Text as="span" variant="bodySm" color={vars.colors.textMuted}>
                      {option.disabled ? option.disabledReason : option.description}
                    </Text>
                  )}
                </Stack>
              </button>
              {selected && children && <div className={styles.details}>{children}</div>}
            </div>
          );
        })}
      </Stack>
    </div>
  );
};
