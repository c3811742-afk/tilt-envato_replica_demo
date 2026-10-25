import { useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import { vars } from '@/shared/theme';
import { cx, withDefaults } from '@/shared/utils';
import { FieldMessage } from '../FieldMessage';
import { Icon } from '../Icon';
import { Stack } from '../Stack';
import { Text } from '../Text';
import { selectDefaults } from './Select.defaults';
import type { SelectProps } from './Select.types';
import styles from './Select.module.css';

// A labelled dropdown in the brand's style (a styled list instead of the browser's own).
// Keyboard: arrows, Home / End and a typed letter move; Enter or Space picks; Esc closes.
export const Select = (props: SelectProps) => {
  const { label, value, options, onChange, id, disabled, listMaxHeight, placeholder, hint, error, required, hideLabel } = withDefaults(
    selectDefaults,
    props,
  );
  const generatedId = useId();
  const buttonId = id ?? generatedId;
  const labelId = `${buttonId}-label`;
  const listId = `${buttonId}-list`;
  const messageId = `${buttonId}-message`;
  const message = error ?? hint;
  const [open, setOpen] = useState(false);
  const foundIndex = options.findIndex((option) => option.value === value);
  const selectedIndex = Math.max(0, foundIndex);
  const [active, setActive] = useState(selectedIndex);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Closes on a click outside.
  useEffect(() => {
    if (!open) return;
    const closeOutside = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', closeOutside);
    return () => document.removeEventListener('mousedown', closeOutside);
  }, [open]);

  // Keeps the active option in view while moving through a long list.
  useEffect(() => {
    if (open) listRef.current?.children[active]?.scrollIntoView({ block: 'nearest' });
  }, [open, active]);

  const openList = () => {
    setActive(selectedIndex);
    setOpen(true);
  };

  const pick = (index: number) => {
    setOpen(false);
    buttonRef.current?.focus();
    const option = options[index];
    if (option && option.value !== value) onChange?.(option.value);
  };

  // The next option whose label starts with a typed letter (from the active one, then from the top).
  const jumpTo = (letter: string) => {
    const startsWith = (index: number) => options[index].label.toLocaleLowerCase().startsWith(letter);
    const order = [...options.keys()].slice(active + 1).concat([...options.keys()].slice(0, active + 1));
    return order.find(startsWith);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const last = options.length - 1;
    const moves: Record<string, number> = {
      ArrowDown: Math.min(last, active + 1),
      ArrowUp: Math.max(0, active - 1),
      Home: 0,
      End: last,
    };
    if (!open) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
        event.preventDefault();
        openList();
      }
      return;
    }
    if (event.key in moves) {
      event.preventDefault();
      setActive(moves[event.key]);
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      pick(active);
    } else if (event.key === 'Escape' || event.key === 'Tab') {
      setOpen(false);
    } else if (event.key.length === 1) {
      const next = jumpTo(event.key.toLocaleLowerCase());
      if (next !== undefined) setActive(next);
    }
  };

  // Nothing chosen yet: the placeholder when there is one, otherwise the first option.
  const selected = foundIndex >= 0 || !placeholder ? options[selectedIndex] : undefined;

  return (
    <Stack gap={vars.spacing[2]}>
      {label && (
        <span className={cx(hideLabel && styles.hiddenLabel)}>
          <Text as="label" id={labelId} htmlFor={buttonId} variant="title">
            {label}
          </Text>
        </span>
      )}
      <div ref={rootRef} className={styles.control} style={{ '--select-list-max-height': listMaxHeight } as CSSProperties}>
        <button
          ref={buttonRef}
          id={buttonId}
          type="button"
          className={cx(styles.select, open && styles.open, error && styles.invalid)}
          disabled={disabled}
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listId}
          aria-labelledby={label && !hideLabel ? `${labelId} ${buttonId}` : undefined}
          aria-label={hideLabel ? label : undefined}
          aria-invalid={error ? true : undefined}
          aria-required={required || undefined}
          aria-describedby={message ? messageId : undefined}
          aria-activedescendant={open ? `${listId}-${active}` : undefined}
          onClick={() => (open ? setOpen(false) : openList())}
          onKeyDown={onKeyDown}
        >
          <span className={cx(styles.value, !selected && styles.placeholder)} dir="auto">
            {selected?.label ?? placeholder}
          </span>
          <span className={cx(styles.chevron, open && styles.flipped)}>
            <Icon name="chevronDown" size={vars.sizes.icon.sm} />
          </span>
        </button>
        {open && (
          <ul ref={listRef} id={listId} role="listbox" aria-labelledby={label ? labelId : undefined} className={styles.list}>
            {options.map((option, index) => (
              <li
                key={option.value}
                id={`${listId}-${index}`}
                role="option"
                aria-selected={option.value === value}
                className={cx(styles.option, index === active && styles.active)}
                onMouseEnter={() => setActive(index)}
                // mousedown keeps the focus on the button while picking.
                onMouseDown={(event) => {
                  event.preventDefault();
                  pick(index);
                }}
              >
                <span dir="auto">{option.label}</span>
                {option.value === value && <Icon name="check" size={vars.sizes.icon.sm} />}
              </li>
            ))}
          </ul>
        )}
      </div>
      <FieldMessage id={messageId} message={message} tone={error ? 'error' : 'hint'} />
    </Stack>
  );
};
