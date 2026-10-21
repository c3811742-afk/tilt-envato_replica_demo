export interface CheckboxProps {
  label: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  description?: string; // a second, muted line under the label
  disabled?: boolean;
  color?: string; // color of the tick box
}
