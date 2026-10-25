import { useLocale } from '@/shared/hooks';
import { withDefaults } from '@/shared/utils';
import { TextField } from '../TextField';
import { dateRangeFieldDefaults } from './DateRangeField.defaults';
import type { DateRangeFieldProps } from './DateRangeField.types';
import styles from './DateRangeField.module.css';

// A start and an end date (the device's calendar), side by side from tablet width up.
// Neither box allows a date that would put the end before the start.
export const DateRangeField = (props: DateRangeFieldProps) => {
  const { text } = useLocale();
  const { value, onChange, fromLabel, toLabel, min, max, errors, required } = withDefaults(dateRangeFieldDefaults, props);
  const from = value.from ?? '';
  const to = value.to ?? '';

  return (
    <div className={styles.range}>
      <TextField
        type="date"
        label={fromLabel ?? text.filters.date.from}
        value={from}
        min={min}
        max={to || max}
        direction="ltr"
        onChange={(date) => onChange?.({ from: date, to })}
        error={errors.from}
        required={required}
      />
      <TextField
        type="date"
        label={toLabel ?? text.filters.date.to}
        value={to}
        min={from || min}
        max={max}
        direction="ltr"
        onChange={(date) => onChange?.({ from, to: date })}
        error={errors.to}
        required={required}
      />
    </div>
  );
};
