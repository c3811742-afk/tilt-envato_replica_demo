import { vars } from '@/shared/theme';
import type { SearchBarProps } from './SearchBar.types';

export const searchBarHeights = vars.sizes.searchBar.height;

export const searchBarDefaults: Required<Pick<SearchBarProps, 'defaultValue' | 'size' | 'autoFocus' | 'suggest' | 'actions'>> = {
  defaultValue: '',
  size: 'md',
  autoFocus: false,
  suggest: true,
  actions: [],
};
