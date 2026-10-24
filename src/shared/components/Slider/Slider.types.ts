export interface SliderProps {
  label?: string; // accessible name; shown above the slider when `showLabel` is on
  showLabel?: boolean;
  value?: number;
  min?: number;
  max?: number;
  step?: number | 'any';
  onChange?: (value: number) => void;
  valueText?: string; // what screen readers announce, e.g. "1:05 of 2:30"
  width?: string;
  color?: string; // the filled part and the handle
  disabled?: boolean;
}
