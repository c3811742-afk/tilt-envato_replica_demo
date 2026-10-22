export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  label?: string;
  value?: string;
  options?: SelectOption[];
  onChange?: (value: string) => void;
  id?: string; // generated when not given
  disabled?: boolean;
}
