export interface PickerItem {
  id: string;
  title: string; // written by users, shown in its own direction
  description?: string; // a second, muted line (e.g. the type and creator)
}

export interface ItemPickerProps {
  label: string;
  items?: PickerItem[];
  selectedIds?: string[];
  onToggle?: (id: string) => void;
  max?: number; // once reached, unticked items are disabled
  hint?: string;
  error?: string;
  maxHeight?: string; // the list scrolls past this height
}
