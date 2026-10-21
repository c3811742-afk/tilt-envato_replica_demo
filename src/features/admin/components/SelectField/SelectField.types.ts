export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectFieldProps {
  label: string;
  options?: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string; // a first, empty option such as "Choose a role"
  hint?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  hideLabel?: boolean;
}
