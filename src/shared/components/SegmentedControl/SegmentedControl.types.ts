import type { ReactNode } from 'react';

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
  extra?: ReactNode; // shown after the label, e.g. a "Save 25%" badge
}

export interface SegmentedControlProps<T extends string> {
  label?: string; // accessible name of the group
  options?: SegmentOption<T>[];
  value?: T;
  onChange?: (value: T) => void;
  size?: 'sm' | 'md';
  fullWidth?: boolean;
  background?: string;
  color?: string; // text color of the options that aren't selected
  selectedBackground?: string;
  selectedColor?: string;
}
