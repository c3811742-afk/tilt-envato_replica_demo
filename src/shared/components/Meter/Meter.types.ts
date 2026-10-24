export interface MeterProps {
  value?: number; // how much is used
  max?: number; // the total; when 0 or less the bar is empty
  label?: string; // what is measured, e.g. "AI credits"
  valueText?: string; // the reading, e.g. "40 of 100 used"; also read by screen readers
  color?: string; // the used part of the bar
  trackColor?: string;
  height?: string;
}
