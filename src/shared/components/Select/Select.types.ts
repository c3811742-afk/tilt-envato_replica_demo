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
  listMaxHeight?: string; // the open list scrolls past this height (long lists, e.g. governorates)
  placeholder?: string; // shown until an option is chosen, e.g. "Choose a reason"
  hint?: string; // help text under the field
  error?: string; // shown under the field in place of the hint
  required?: boolean; // announced to screen readers; validation is done by the form
  hideLabel?: boolean; // the label is read by screen readers only
}
