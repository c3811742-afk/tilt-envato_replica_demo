import { useNavigate } from 'react-router';
import { ChipGroup, Stack } from '@/shared/components';
import { gridSizes, pagingModes, resultViewIcons, resultViews, sortOptions, type SortOption } from '@/shared/constants';
import { useLocale, useStoredValue, type useSearchFilters } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { preferences } from '@/shared/utils';
import { FilterGroup } from './FilterGroup';

interface ResultOptionsProps {
  search: ReturnType<typeof useSearchFilters>;
}

// How results are ordered and shown, at the top of the side panel: sort, grid or list, card size, paging.
// Plain choices in the panel (no pop-up menus), like the filters under them.
export const ResultOptions = ({ search }: ResultOptionsProps) => {
  const { text } = useLocale();
  const navigate = useNavigate();
  const [gridSize, setGridSize] = useStoredValue(preferences.gridSize);
  const [fontView, setFontView] = useStoredValue(preferences.fontView);
  const [pagingMode, setPagingMode] = useStoredValue(preferences.pagingMode);
  const tracks = search.categoryId === 'music' || search.categoryId === 'soundEffects' || Boolean(search.soundsLike);
  const fonts = search.categoryId === 'fonts';

  return (
    <Stack gap={vars.spacing[5]}>
      <FilterGroup label={text.search.sortLabel}>
        <ChipGroup<SortOption>
          value={[search.sort]}
          onChange={([sort]) => sort && navigate(search.pathWith({ sort }))}
          options={sortOptions.map((option) => ({ value: option, label: text.search.sort[option] }))}
        />
      </FilterGroup>
      {fonts && (
        <FilterGroup label={text.search.view}>
          <ChipGroup
            value={[fontView]}
            onChange={([view]) => view && setFontView(view)}
            options={resultViews.map((view) => ({ value: view, label: text.search.views[view], icon: resultViewIcons[view] }))}
          />
        </FilterGroup>
      )}
      {!tracks && (!fonts || fontView === 'grid') && (
        <FilterGroup label={text.search.gridSize}>
          <ChipGroup
            value={[gridSize]}
            onChange={([size]) => size && setGridSize(size)}
            options={gridSizes.map((size) => ({ value: size, label: text.search.gridSizes[size] }))}
          />
        </FilterGroup>
      )}
      <FilterGroup label={text.search.paging}>
        <ChipGroup
          value={[pagingMode]}
          onChange={([mode]) => {
            if (!mode) return;
            setPagingMode(mode);
            navigate(search.pathWith({ page: 1 }), { replace: true });
          }}
          options={pagingModes.map((mode) => ({ value: mode, label: text.search.pagingModes[mode] }))}
        />
      </FilterGroup>
    </Stack>
  );
};

