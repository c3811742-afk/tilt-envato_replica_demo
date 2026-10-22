import { useId, type CSSProperties } from 'react';
import { vars } from '@/shared/theme';
import { withDefaults } from '@/shared/utils';
import { Stack } from '../Stack';
import { Text } from '../Text';
import { sliderDefaults } from './Slider.defaults';
import type { SliderProps } from './Slider.types';
import styles from './Slider.module.css';

// A range slider (volume, playing position, font size). Native input: works with the keyboard and mirrors in Arabic.
export const Slider = (props: SliderProps) => {
  const { label, showLabel, value, min, max, step, onChange, valueText, width, color, disabled } = withDefaults(sliderDefaults, props);
  const id = useId();
  const style = { '--slider-width': width, '--slider-color': color } as CSSProperties;

  return (
    <Stack gap={vars.spacing[1]}>
      {showLabel && label && (
        <Text as="label" htmlFor={id} variant="label" color={vars.colors.textMuted}>
          {label}
        </Text>
      )}
      <input
        id={id}
        type="range"
        className={styles.slider}
        style={style}
        value={value}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        aria-label={showLabel ? undefined : label}
        aria-valuetext={valueText}
        onChange={(event) => onChange?.(Number(event.target.value))}
      />
    </Stack>
  );
};
