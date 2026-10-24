export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  label?: string;
  hideLabel?: boolean; // the label is read by screen readers only (e.g. in a row of filters whose options say what they are)
  value?: string;
  options?: SelectOption[];
  onChange?: (value: string) => void;
  id?: string; // generated when not given
  disabled?: boolean;
  listMaxHeight?: string; // the open list scrolls past this height (long lists, e.g. governorates)
}
