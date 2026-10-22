import { Checkbox, ChipGroup, FieldMessage, Stack, Text } from '@/shared/components';
import { filterControls, filterOptions, type FilterKey } from '@/shared/constants';
import { useCategories, useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import type { CategoryId, Facets, FilterValues } from '@/shared/types';
import { fillText, formatNumber, isCategoryId } from '@/shared/utils';
import { DateRangeFilter, type UploadRange } from './DateRangeFilter';

interface FilterPanelProps {
  categoryId?: CategoryId;
  keys: readonly FilterKey[]; // the filters this category offers, in order
  filters: FilterValues;
  facets: Facets; // results each option would have
  onCategoryChange: (categoryId?: CategoryId) => void;
  onChange: (filters: FilterValues) => void;
  range: UploadRange; // custom upload dates
  onRangeChange: (range: UploadRange) => void;
}

// The search filters: category first, then the filters for that category. Options with no results are hidden.
export const FilterPanel = ({ categoryId, keys, filters, facets, onCategoryChange, onChange, range, onRangeChange }: FilterPanelProps) => {
  const { text, locale } = useLocale();
  const categories = useCategories();
  const set = (key: FilterKey, values: string[]) => onChange({ ...filters, [key]: values.length ? values : undefined });

  return (
    <Stack gap={vars.spacing[5]}>
      {/* Category is a group of chips like every other filter. "All categories" clears it. */}
      <Stack gap={vars.spacing[2]}>
        <Text as="h2" variant="title">
          {text.search.category}
        </Text>
        <ChipGroup<string>
          value={[categoryId ?? '']}
          onChange={(values) => onCategoryChange(isCategoryId(values[0]) ? values[0] : undefined)}
          options={[
            { value: '', label: text.search.allCategories },
            ...(categories.status === 'success' ? categories.data : []).map((category) => ({
              value: category.id,
              label: text.categories[category.id].name,
              icon: category.icon,
            })),
          ]}
        />
      </Stack>
      {keys.map((key) => {
        const selected = filters[key] ?? [];
        const counts = facets[key] ?? {};
        const options = (filterOptions[key] as readonly string[]).filter((value) => (counts[value] ?? 0) > 0 || selected.includes(value));
        if (!options.length && key !== 'date') return null;
        const labels = text.filters[key].options as Record<string, string>;
        const withCount = (value: string) => fillText(text.filters.optionCount, { option: labels[value], count: formatNumber(counts[value] ?? 0, locale) });
        const control = filterControls[key];

        return (
          <Stack key={key} gap={vars.spacing[2]}>
            <Text as="h2" variant="title">
              {text.filters[key].label}
            </Text>
            {control === 'toggle' && (
              <Checkbox label={withCount(options[0])} checked={selected.length > 0} onChange={(checked) => set(key, checked ? [options[0]] : [])} />
            )}
            {(control === 'chips' || control === 'single') && (
              <ChipGroup<string>
                multiple={control === 'chips'}
                value={selected}
                // One-choice filters: picking the selected option again clears it.
                onChange={(values) => set(key, control === 'single' && values[0] === selected[0] ? [] : values)}
                options={options.map((value) => ({ value, label: withCount(value) }))}
              />
            )}
            {key === 'contentId' && <FieldMessage message={text.filters.contentId.hint} />}
            {/* Restarts when the range is cleared elsewhere (a chip, "Clear all"). */}
            {key === 'date' && <DateRangeFilter key={`${range.from}-${range.to}`} value={range} onChange={onRangeChange} />}
          </Stack>
        );
      })}
    </Stack>
  );
};
