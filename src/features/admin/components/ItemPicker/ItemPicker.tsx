import { useState, type CSSProperties } from 'react';
import { Checkbox, FieldGroup, Text, TextField } from '@/shared/components';
import { useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { matchesText, withDefaults } from '@/shared/utils';


import { itemPickerDefaults } from './ItemPicker.defaults';
import type { ItemPickerProps } from './ItemPicker.types';
import styles from './ItemPicker.module.css';

// A searchable list of tick boxes, for choosing several items from a long list (e.g. free elements of the month).
export const ItemPicker = (props: ItemPickerProps) => {
  const { label, items, selectedIds, onToggle, max, hint, error, maxHeight } = withDefaults(itemPickerDefaults, props);
  const { text } = useLocale();
  const [query, setQuery] = useState('');
  const visible = items.filter((item) => matchesText(query, ...[item.title, item.description ?? '']));
  const full = max !== undefined && selectedIds.length >= max;
  const style = { '--item-picker-max-height': maxHeight } as CSSProperties;

  return (
    <FieldGroup label={label} hint={hint} error={error}>
      <TextField type="search" label={text.admin.common.search} value={query} onChange={setQuery} />
      {visible.length > 0 ? (
        <ul className={styles.list} style={style}>
          {visible.map((item) => {
            const checked = selectedIds.includes(item.id);
            return (
              <li key={item.id}>
                <Checkbox
                  label={item.title}
                  description={item.description}
                  checked={checked}
                  disabled={full && !checked}
                  onChange={() => onToggle?.(item.id)}
                />
              </li>
            );
          })}
        </ul>
      ) : (
        <Text color={vars.colors.textMuted}>{text.admin.common.noMatchesShort}</Text>
      )}
    </FieldGroup>
  );
};
