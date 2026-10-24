import { DetailList } from '@/shared/components';
import { formatSoftware } from '@/shared/constants';
import { useLocale } from '@/shared/hooks';
import type { Item } from '@/shared/types';
import { fillText, formatDate, formatDuration, formatFileSize, formatNumber } from '@/shared/utils';

// The item's details: what every item has, then what its kind of file has (resolution, tempo, apps…).
export const ItemFacts = ({ item }: { item: Item }) => {
  const { text, locale } = useLocale();
  const { filters } = text;
  const apps = [...new Set(item.formats.map((format) => formatSoftware[format]).filter((app) => app !== undefined))];

  const rows = [
    { label: text.item.category, value: text.categories[item.categoryId].name },
    { label: text.item.formats, value: item.formats.join(', ') },
    { label: text.item.fileSize, value: formatFileSize(item.fileSize, locale) },
    ...(apps.length ? [{ label: filters.software.label, value: apps.map((app) => filters.software.options[app]).join(', ') }] : []),
    ...(item.plugins
      ? [
          {
            label: filters.plugins.label,
            value: item.plugins.length
              ? item.plugins.map((plugin) => filters.plugins.options[plugin]).join(', ')
              : filters.plugins.options.none,
          },
        ]
      : []),
    ...(item.resolution ? [{ label: filters.resolution.label, value: filters.resolution.options[item.resolution] }] : []),
    ...(item.orientation ? [{ label: filters.orientation.label, value: filters.orientation.options[item.orientation] }] : []),
    ...(item.duration ? [{ label: text.item.duration, value: formatDuration(item.duration) }] : []),
    ...(item.music
      ? [
          { label: text.item.tempo, value: fillText(text.item.bpm, { bpm: formatNumber(item.music.bpm, locale) }) },
          { label: filters.mood.label, value: item.music.moods.map((mood) => filters.mood.options[mood]).join(', ') },
          { label: filters.genre.label, value: item.music.genres.map((genre) => filters.genre.options[genre]).join(', ') },
          { label: filters.contentId.label, value: filters.contentId.options[item.music.contentId] },
        ]
      : []),
    ...(item.font
      ? [
          { label: filters.fontCategory.label, value: filters.fontCategory.options[item.font.category] },
          { label: filters.optimumSize.label, value: filters.optimumSize.options[item.font.optimumSize] },
          { label: filters.spacing.label, value: filters.spacing.options[item.font.spacing] },
        ]
      : []),
    {
      label: text.item.rating,
      value: fillText(text.item.ratingValue, { rating: formatNumber(item.rating, locale), count: formatNumber(item.ratingCount, locale) }),
    },
    { label: text.item.downloads, value: formatNumber(item.downloads, locale) },
    { label: text.item.published, value: formatDate(item.createdAt, locale) },
  ];

  return <DetailList rows={rows} />;
};
