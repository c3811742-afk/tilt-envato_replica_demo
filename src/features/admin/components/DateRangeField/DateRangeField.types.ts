export interface DateRange {
  start: string; // YYYY-MM-DD
  end: string;
}

export interface DateRangeFieldProps {
  value?: DateRange;
  onChange?: (value: DateRange) => void;
  startLabel?: string; // defaults to "Start date"
  endLabel?: string; // defaults to "End date"
  errors?: { start?: string; end?: string };
  required?: boolean;
}
