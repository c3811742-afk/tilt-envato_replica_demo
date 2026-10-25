export interface DateRange {
  from?: string; // ISO date (YYYY-MM-DD); empty or missing: no start
  to?: string;
}

export interface DateRangeFieldProps {
  value?: DateRange;
  onChange?: (value: DateRange) => void;
  fromLabel?: string; // defaults to "From"
  toLabel?: string; // defaults to "To"
  min?: string; // earliest date either box accepts
  max?: string; // latest date either box accepts
  errors?: { from?: string; to?: string }; // shown under each box
  required?: boolean;
}
