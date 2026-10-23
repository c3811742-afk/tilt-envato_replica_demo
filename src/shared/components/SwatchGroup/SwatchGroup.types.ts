export interface Swatch<T extends string> {
  value: T;
  label: string; // the color's name, read by screen readers
  color: string; // the color shown
  onColor: string; // readable color for the check mark on top
}

export interface SwatchGroupProps<T extends string> {
  label?: string; // accessible name of the group
  options?: Swatch<T>[];
  value?: T; // the picked color (one at most)
  onChange?: (value: T) => void;
  multiple?: boolean; // pick several colors (e.g. a color filter) with `values` and `onValuesChange`
  values?: T[];
  onValuesChange?: (values: T[]) => void;
  size?: string;
}
