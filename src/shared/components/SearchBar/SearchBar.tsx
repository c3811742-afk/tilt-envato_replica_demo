import { useId, useState, type CSSProperties, type FormEvent, type KeyboardEvent } from 'react';
import { useNavigate } from 'react-router';
import { catalog, categoryIcons, itemPath, searchPath } from '@/shared/constants';
import { useAsync, useDebouncedValue, useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import type { SearchSuggestion } from '@/shared/types';
import { api, cx, fillText, withDefaults } from '@/shared/utils';
import { Icon } from '../Icon';
import { searchBarDefaults, searchBarHeights } from './SearchBar.defaults';
import type { SearchBarProps } from './SearchBar.types';
import styles from './SearchBar.module.css';

const noSuggestions: SearchSuggestion[] = [];

// The site search box, with suggestions while typing. An empty search opens the full catalog.
export const SearchBar = (props: SearchBarProps) => {
  const { defaultValue, size, placeholder, label, onSearch, autoFocus, suggest } = withDefaults(searchBarDefaults, props);
  const { text, locale } = useLocale();
  const navigate = useNavigate();
  const [query, setQuery] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const listId = useId();

  // Suggestions are a help, not the search itself: if they fail to load, the box simply shows none.
  const typed = useDebouncedValue(query.trim(), catalog.suggestDelayMs);
  const loaded = useAsync(() => (suggest && typed ? api.getSuggestions(typed) : Promise.resolve(noSuggestions)), [typed, suggest]);
  const suggestions = loaded.status === 'success' ? loaded.data : noSuggestions;
  const showList = open && suggestions.length > 0 && query.trim().length > 0;

  const search = (value: string) => {
    setOpen(false);
    if (onSearch) onSearch(value.trim());
    else navigate(searchPath({ query: value }));
  };

  const choose = (suggestion: SearchSuggestion) => {
    setOpen(false);
    if (suggestion.kind === 'term') {
      setQuery(suggestion.term);
      search(suggestion.term);
    } else if (suggestion.kind === 'category') navigate(searchPath({ category: suggestion.categoryId }));
    else navigate(itemPath(suggestion.item.id));
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (showList && active >= 0) choose(suggestions[active]);
    else search(query);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      setOpen(false);
      return;
    }
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    event.preventDefault();
    setOpen(true);
    const step = event.key === 'ArrowDown' ? 1 : -1;
    setActive((current) => (suggestions.length ? (current + step + suggestions.length) % suggestions.length : -1));
  };

  const labelOf = (suggestion: SearchSuggestion) => {
    if (suggestion.kind === 'term') return suggestion.term;
    if (suggestion.kind === 'category') return text.categories[suggestion.categoryId].name;
    return suggestion.item.title[locale];
  };

  const style = { '--search-bar-height': searchBarHeights[size] } as CSSProperties;

  return (
    <form role="search" className={styles.searchBar} style={style} onSubmit={submit}>
      <input
        type="search"
        className={styles.input}
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
          setActive(-1);
        }}
        onFocus={() => setOpen(true)}
        // Closing waits a moment so a click on a suggestion still lands.
        onBlur={() => setTimeout(() => setOpen(false), catalog.suggestDelayMs)}
        onKeyDown={onKeyDown}
        placeholder={placeholder ?? text.search.placeholder}
        aria-label={label ?? text.search.label}
        autoFocus={autoFocus}
        enterKeyHint="search"
        dir="auto"
        role={suggest ? 'combobox' : undefined}
        aria-autocomplete={suggest ? 'list' : undefined}
        aria-expanded={suggest ? showList : undefined}
        aria-controls={suggest ? listId : undefined}
        aria-activedescendant={showList && active >= 0 ? `${listId}-${active}` : undefined}
        autoComplete="off"
      />
      <button type="submit" className={styles.submit} aria-label={text.search.submit}>
        <Icon name="search" />
      </button>
      {showList && (
        <ul id={listId} role="listbox" aria-label={text.search.suggestions} className={styles.suggestions}>
          {suggestions.map((suggestion, index) => (
            <li
              key={`${suggestion.kind}-${labelOf(suggestion)}`}
              id={`${listId}-${index}`}
              role="option"
              aria-selected={index === active}
              className={cx(styles.suggestion, index === active && styles.active)}
              // mousedown, not click: it runs before the input loses focus and closes the list.
              onMouseDown={(event) => {
                event.preventDefault();
                choose(suggestion);
              }}
            >
              <Icon
                name={suggestion.kind === 'term' ? 'search' : suggestion.kind === 'category' ? categoryIcons[suggestion.categoryId] : categoryIcons[suggestion.item.categoryId]}
                size={vars.sizes.icon.sm}
              />
              <span className={styles.suggestionText} dir="auto">
                {labelOf(suggestion)}
              </span>
              {suggestion.kind === 'item' && (
                <span className={styles.hint}>{fillText(text.search.inCategory, { category: text.categories[suggestion.item.categoryId].name })}</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </form>
  );
};
