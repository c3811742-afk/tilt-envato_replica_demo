import type { IconName } from '@/shared/assets';

// An icon button inside the search box, e.g. search by image.
export interface SearchBarAction {
  icon: IconName;
  label: string; // its accessible name and tooltip
  onClick: () => void;
}

export interface SearchBarProps {
  defaultValue?: string; // the query shown when the bar first renders (change `key` to reset it)
  size?: 'md' | 'lg';
  placeholder?: string; // defaults to the search placeholder of the active language
  label?: string; // accessible name; defaults to "Search" in the active language
  onSearch?: (query: string) => void; // defaults to opening the search page with the query
  onChange?: (query: string) => void; // every keystroke, to filter a list as the user types (e.g. their collections)
  autoFocus?: boolean;
  suggest?: boolean; // show suggestions under the box while typing
  actions?: SearchBarAction[]; // icon buttons next to the search button (advanced search, by image…)
}
