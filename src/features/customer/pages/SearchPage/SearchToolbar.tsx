import type { ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { Button, Dropdown, Icon, SegmentedControl, Select, Stack, Text } from '@/shared/components';
import { gridSizes, pagingModes, resultViews, sortOptions } from '@/shared/constants';
import { useLocale, useStoredValue, type useSearchFilters } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { countSelectedFilters, fillText, formatNumber, preferences } from '@/shared/utils';
import styles from './SearchPage.module.css';

export type SearchDialog = 'filters' | 'advanced' | 'image' | 'music';

interface SearchToolbarProps {
  search: ReturnType<typeof useSearchFilters>;
  onOpen: (dialog: SearchDialog) => void;
}

// Sort, view settings, and the other ways to search: advanced, by image, similar music.
export const SearchToolbar = ({ search, onOpen }: SearchToolbarProps) => {
  const { text, locale } = useLocale();
  const navigate = useNavigate();
  const [gridSize, setGridSize] = useStoredValue(preferences.gridSize);
  const [fontView, setFontView] = useStoredValue(preferences.fontView);
  const [pagingMode, setPagingMode] = useStoredValue(preferences.pagingMode);
  const selected = countSelectedFilters(search.filters);
  const tracks = search.categoryId === 'music' || search.categoryId === 'soundEffects' || Boolean(search.soundsLike);

  return (
    <Stack direction="row" wrap align="flex-end" justify="space-between" gap={vars.spacing[3]}>
      <Stack direction="row" wrap align="flex-end" gap={vars.spacing[3]}>
        <div className={styles.phoneFilters} data-tour="filtersButton">
          <Button variant="outline" onClick={() => onOpen('filters')}>
            <Icon name="filter" size={vars.sizes.icon.sm} />
            {selected ? fillText(text.filters.titleWithCount, { count: formatNumber(selected, locale) }) : text.filters.title}
          </Button>
        </div>
        <Select
          label={text.search.sortLabel}
          value={search.sort}
          onChange={(sort) => navigate(search.pathWith({ sort: sort as typeof search.sort }))}
          options={sortOptions.map((option) => ({ value: option, label: text.search.sort[option] }))}
        />
        {/* As tall as the sort box next to it. */}
        <Dropdown
          label={text.search.view}
          triggerHeight={vars.sizes.input.height}
          trigger={
            <>
              <Icon name="grid" size={vars.sizes.icon.sm} />
              <span>{text.search.view}</span>
            </>
          }
        >
          <Stack gap={vars.spacing[4]}>
            {search.categoryId === 'fonts' && (
              <ViewSetting label={text.search.view}>
                <SegmentedControl
                  label={text.search.view}
                  size="sm"
                  fullWidth
                  value={fontView}
                  onChange={setFontView}
                  options={resultViews.map((view) => ({ value: view, label: text.search.views[view] }))}
                />
              </ViewSetting>
            )}
            {!tracks && (search.categoryId !== 'fonts' || fontView === 'grid') && (
              <ViewSetting label={text.search.gridSize}>
                <SegmentedControl
                  label={text.search.gridSize}
                  size="sm"
                  fullWidth
                  value={gridSize}
                  onChange={setGridSize}
                  options={gridSizes.map((size) => ({ value: size, label: text.search.gridSizes[size] }))}
                />
              </ViewSetting>
            )}
            <ViewSetting label={text.search.paging}>
              <SegmentedControl
                label={text.search.paging}
                size="sm"
                fullWidth
                value={pagingMode}
                onChange={(mode) => {
                  setPagingMode(mode);
                  navigate(search.pathWith({ page: 1 }), { replace: true });
                }}
                options={pagingModes.map((mode) => ({ value: mode, label: text.search.pagingModes[mode] }))}
              />
            </ViewSetting>
          </Stack>
        </Dropdown>
      </Stack>

      <Stack direction="row" wrap gap={vars.spacing[2]}>
        <Button variant="muted" onClick={() => onOpen('advanced')}>
          <Icon name="search" size={vars.sizes.icon.sm} />
          {text.search.advanced}
        </Button>
        <Button variant="muted" onClick={() => onOpen('image')}>
          <Icon name="camera" size={vars.sizes.icon.sm} />
          {text.search.byImage}
        </Button>
        {(!search.categoryId || tracks) && (
          <Button variant="muted" onClick={() => onOpen('music')}>
            <Icon name="music" size={vars.sizes.icon.sm} />
            {text.search.similarMusic}
          </Button>
        )}
      </Stack>
    </Stack>
  );
};

const ViewSetting = ({ label, children }: { label: string; children: ReactNode }) => (
  <Stack gap={vars.spacing[1]}>
    <Text as="span" variant="label" color={vars.colors.textMuted}>
      {label}
    </Text>
    {children}
  </Stack>
);
