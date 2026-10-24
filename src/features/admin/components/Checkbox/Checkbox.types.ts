export interface CheckboxProps {
  label: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  description?: string; // a second, muted line under the label
  disabled?: boolean;
  color?: string; // color of the tick box
  hideLabel?: boolean; // for tick boxes in a grid whose row and column already say what they are; the label is read by screen readers
}
