import type { CSSProperties } from 'react';
import { vars } from '@/shared/theme';
import { withDefaults } from '@/shared/utils';
import { Icon } from '../Icon';
import type { Swatch, SwatchGroupProps } from './SwatchGroup.types';
import { swatchGroupDefaults } from './SwatchGroup.defaults';
import styles from './SwatchGroup.module.css';

// A row of color dots: pick one color (the site's accent color, a radio group)
// or several (a color filter, toggle buttons).
export const SwatchGroup = <T extends string>(props: SwatchGroupProps<T>) => {
  const resolved = withDefaults(swatchGroupDefaults, props);
  const { label, value, onChange, multiple, onValuesChange, size } = resolved;
  const options = resolved.options as Swatch<T>[];
  const values = resolved.values as T[];

  const isSelected = (option: T) => (multiple ? values.includes(option) : option === value);
  const pick = (option: T) => {
    if (!multiple) onChange?.(option);
    else onValuesChange?.(values.includes(option) ? values.filter((selected) => selected !== option) : [...values, option]);
  };

  return (
    <div role={multiple ? 'group' : 'radiogroup'} aria-label={label} className={styles.group} style={{ '--swatch-size': size } as CSSProperties}>
      {options.map((option) => {
        const selected = isSelected(option.value);
        return (
          <button
            key={option.value}
            type="button"
            role={multiple ? undefined : 'radio'}
            aria-checked={multiple ? undefined : selected}
            aria-pressed={multiple ? selected : undefined}
            aria-label={option.label}
            title={option.label}
            className={styles.swatch}
            style={{ '--swatch-color': option.color, '--swatch-on-color': option.onColor } as CSSProperties}
            onClick={() => pick(option.value)}
          >
            {selected && <Icon name="check" size={vars.sizes.icon.sm} />}
          </button>
        );
      })}
    </div>
  );
};
