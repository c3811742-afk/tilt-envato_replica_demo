import { useState } from 'react';
import { FieldMessage, Grid, Stack, Text, TextField } from '@/shared/components';
import { catalog } from '@/shared/constants';
import { useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { fillText, isIsoDate, keepDigits } from '@/shared/utils';

export interface UploadRange {
  from?: string; // ISO date
  to?: string;
}

interface DateRangeFilterProps {
  value: UploadRange;
  onChange: (range: UploadRange) => void;
}

const yearDigits = 4;

// The year the range covers, when it is exactly one calendar year ("2026-01-01" to "2026-12-31").
const yearOf = ({ from, to }: UploadRange) =>
  from && to && from.endsWith('-01-01') && to.endsWith('-12-31') && from.slice(0, yearDigits) === to.slice(0, yearDigits)
    ? from.slice(0, yearDigits)
    : '';

// A custom upload date: type a year, or pick a start and end date from the calendar.
// The range applies as soon as it is valid; a half range (only a start or only an end) works too.
export const DateRangeFilter = ({ value, onChange }: DateRangeFilterProps) => {
  const { text } = useLocale();
  const labels = text.filters.date;
  // Today, read once: the latest date and year the range accepts.
  const [today] = useState(() => new Date().toISOString().split('T')[0]);
  const thisYear = Number(today.slice(0, yearDigits));
  const [year, setYear] = useState(yearOf(value));
  const [from, setFrom] = useState(value.from ?? '');
  const [to, setTo] = useState(value.to ?? '');
  const [yearError, setYearError] = useState<string>();
  const [rangeError, setRangeError] = useState<string>();

  const changeYear = (typed: string) => {
    const digits = keepDigits(typed, yearDigits);
    setYear(digits);
    setYearError(undefined);
    if (!digits) {
      setFrom('');
      setTo('');
      onChange({});
      return;
    }
    if (digits.length < yearDigits) return;
    const number = Number(digits);
    if (number < catalog.earliestUploadYear || number > thisYear) {
      setYearError(fillText(labels.yearInvalid, { min: catalog.earliestUploadYear, max: thisYear }));
      return;
    }
    const range = { from: `${digits}-01-01`, to: `${digits}-12-31` };
    setFrom(range.from);
    setTo(range.to);
    setRangeError(undefined);
    onChange(range);
  };

  const changeDates = (nextFrom: string, nextTo: string) => {
    setFrom(nextFrom);
    setTo(nextTo);
    setYear(yearOf({ from: nextFrom, to: nextTo }));
    setYearError(undefined);
    if (isIsoDate(nextFrom) && isIsoDate(nextTo) && nextFrom > nextTo) {
      setRangeError(labels.rangeInvalid);
      return;
    }
    setRangeError(undefined);
    onChange({ from: isIsoDate(nextFrom) ? nextFrom : undefined, to: isIsoDate(nextTo) ? nextTo : undefined });
  };

  const earliest = `${catalog.earliestUploadYear}-01-01`;

  return (
    <Stack gap={vars.spacing[3]}>
      <Text variant="bodySm" color={vars.colors.textMuted}>
        {labels.customRange}
      </Text>
      <TextField
        label={labels.year}
        value={year}
        onChange={changeYear}
        inputMode="numeric"
        direction="ltr"
        maxLength={yearDigits}
        placeholder={fillText(labels.yearPlaceholder, { year: thisYear })}
        error={yearError}
      />
      <Grid as="div" columns={2} gap={vars.spacing[2]}>
        <TextField label={labels.from} type="date" value={from} min={earliest} max={to || today} direction="ltr" onChange={(date) => changeDates(date, to)} />
        <TextField label={labels.to} type="date" value={to} min={from || earliest} max={today} direction="ltr" onChange={(date) => changeDates(from, date)} />
      </Grid>
      <FieldMessage tone="error" message={rangeError} />
    </Stack>
  );
};
