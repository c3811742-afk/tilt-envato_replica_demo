import { useId, type CSSProperties } from 'react';
import { vars } from '@/shared/theme';
import { withDefaults } from '@/shared/utils';
import { Stack } from '../Stack';
import { Text } from '../Text';
import { meterDefaults } from './Meter.defaults';
import type { MeterProps } from './Meter.types';
import styles from './Meter.module.css';

// How much of an allowance is used (AI credits, downloads): a label, the reading and a bar.
export const Meter = (props: MeterProps) => {
  const { value, max, label, valueText, color, trackColor, height } = withDefaults(meterDefaults, props);
  const labelId = useId();
  const total = Math.max(max, 0);
  const share = total > 0 ? Math.min(1, Math.max(0, value / total)) : 0;
  const style = {
    // Any use shows at least a square of fill: 5 of 500 credits is under 1%, too thin to see otherwise.
    '--meter-fill': share > 0 ? `max(${share * 100}%, ${height})` : '0%',
    '--meter-color': color,
    '--meter-track': trackColor,
    '--meter-height': height,
  } as CSSProperties;

  return (
    <Stack gap={vars.spacing[2]}>
      {(label || valueText) && (
        <Stack direction="row" wrap justify="space-between" gap={vars.spacing[2]}>
          {label && (
            <Text as="span" variant="title" id={labelId}>
              {label}
            </Text>
          )}
          {valueText && (
            <Text as="span" variant="bodySm">
              {valueText}
            </Text>
          )}
        </Stack>
      )}
      <div
        className={styles.track}
        style={style}
        role="meter"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={Math.min(Math.max(value, 0), total)}
        aria-valuetext={valueText}
        aria-labelledby={label ? labelId : undefined}
      >
        <div className={styles.fill} />
      </div>
    </Stack>
  );
};
