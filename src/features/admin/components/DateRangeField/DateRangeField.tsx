import { useLocale } from '@/shared/hooks';
import { withDefaults } from '@/shared/utils';

import { dateRangeFieldDefaults } from './DateRangeField.defaults';
import type { DateRangeFieldProps } from './DateRangeField.types';
import styles from './DateRangeField.module.css';
import { TextField } from '@/shared/components';

// A start and an end date side by side. The end date can't be picked before the start date.
export const DateRangeField = (props: DateRangeFieldProps) => {
  const { text } = useLocale();
  const {
    value,
    onChange,
    startLabel = text.admin.common.startDate,
    endLabel = text.admin.common.endDate,
    errors,
    required,
  } = withDefaults(dateRangeFieldDefaults, props);

  return (
    <div className={styles.range}>
      <TextField
        type="date"
        label={startLabel}
        value={value.start}
        onChange={(start) => onChange?.({ ...value, start })}
        error={errors.start}
        required={required}
      />
      <TextField
        type="date"
        label={endLabel}
        value={value.end}
        min={value.start || undefined}
        onChange={(end) => onChange?.({ ...value, end })}
        error={errors.end}
        required={required}
      />
    </div>
  );
};
