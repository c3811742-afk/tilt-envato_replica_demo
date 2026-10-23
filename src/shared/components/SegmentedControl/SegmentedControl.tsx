import type { CSSProperties } from 'react';
import { cx, withDefaults } from '@/shared/utils';
import { segmentedControlDefaults, segmentHeights } from './SegmentedControl.defaults';
import type { SegmentedControlProps, SegmentOption } from './SegmentedControl.types';
import styles from './SegmentedControl.module.css';

// A row of mutually exclusive options (plan length, demo view). Works as a radio group.
export const SegmentedControl = <T extends string>(props: SegmentedControlProps<T>) => {
  const resolved = withDefaults(segmentedControlDefaults, props);
  const { label, value, onChange, size, fullWidth, background, color, selectedBackground, selectedColor } = resolved;
  const options = resolved.options as SegmentOption<T>[];

  const style = {
    '--segment-height': segmentHeights[size],
    '--segment-background': background,
    '--segment-color': color,
    '--segment-selected-background': selectedBackground,
    '--segment-selected-color': selectedColor,
  } as CSSProperties;

  return (
    <div role="radiogroup" aria-label={label} className={cx(styles.group, fullWidth && styles.fullWidth)} style={style}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            className={cx(styles.segment, selected && styles.selected)}
            onClick={() => onChange?.(option.value)}
          >
            {option.label}
            {option.extra}
          </button>
        );
      })}
    </div>
  );
};
