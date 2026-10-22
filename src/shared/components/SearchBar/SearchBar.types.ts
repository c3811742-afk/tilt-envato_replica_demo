export interface SearchBarProps {
  defaultValue?: string; // the query shown when the bar first renders (change `key` to reset it)
  size?: 'md' | 'lg';
  placeholder?: string; // defaults to the search placeholder of the active language
  label?: string; // accessible name; defaults to "Search" in the active language
  onSearch?: (query: string) => void; // defaults to opening the search page with the query
  autoFocus?: boolean;
  suggest?: boolean; // show suggestions under the box while typing
}
