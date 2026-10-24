import type { IconName } from '@/shared/assets';

export interface MenuItem {
  key: string;
  label: string;
  icon?: IconName;
  onSelect: () => void;
  danger?: boolean; // a destructive action (e.g. Delete), shown in the danger color
  section?: string; // the group it belongs to; a heading is shown above the first item of each group
  disabled?: boolean;
}

export interface MenuProps {
  label?: string; // accessible name of the button that opens the menu, e.g. "More actions"
  icon?: IconName; // what that button shows
  items?: MenuItem[];
  columns?: boolean; // the groups side by side (e.g. "Quick edits" next to "Use in")
  width?: string; // of the open list
  columnsWidth?: string; // of the open list when the groups are side by side
}
