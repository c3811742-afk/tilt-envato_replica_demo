import { useState } from 'react';
import { Link } from 'react-router';
import { FontPreviewControls, FontSample, fontPreviewDefaults, Grid, Stack, Text, type FontPreviewSettings } from '@/shared/components';
import { itemPath, type GridSize } from '@/shared/constants';
import { useLocale, useStoredValue } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import type { Item } from '@/shared/types';
import { fillText, preferences } from '@/shared/utils';
import { ItemSaveActions } from '@/features/customer/components';
import { DownloadButton } from './DownloadButton';
import styles from './SearchPage.module.css';

interface FontResultsProps {
  items: Item[];
  label: string;
  gridSize: GridSize;
}

// Fonts as samples of the user's own text: a list of large samples, or a grid of cards.
export const FontResults = ({ items, label, gridSize }: FontResultsProps) => {
  const { text, locale } = useLocale();
  const [view] = useStoredValue(preferences.fontView);
  const [preview, setPreview] = useState<FontPreviewSettings>(fontPreviewDefaults);
  const sampleFor = (item: Item) => preview.text || text.fontPreview.sample[item.font?.arabic ? locale : 'en'];

  return (
    <Stack gap={vars.spacing[5]}>
      <FontPreviewControls value={preview} onChange={setPreview} />
      {view === 'list' ? (
        <Stack as="ul" gap={vars.spacing[0]} ariaLabel={label}>
          {items.map((item) => (
            <li key={item.id} className={styles.fontRow}>
              <Stack direction="row" wrap align="center" justify="space-between" gap={vars.spacing[3]}>
                <Stack gap={vars.spacing[0]}>
                  <Link to={itemPath(item.id)} className={styles.fontLink}>
                    <Text as="span" variant="title" autoDirection>
                      {item.title[locale]}
                    </Text>
                  </Link>
                  <Text variant="bodySm" color={vars.colors.textMuted}>
                    {fillText(text.item.by, { creator: item.creator.name })}
                  </Text>
                </Stack>
                <Stack direction="row" gap={vars.spacing[2]}>
                  <DownloadButton item={item} />
                  <ItemSaveActions item={item} />
                </Stack>
              </Stack>
              <FontSample family={item.font?.family} text={sampleFor(item)} size={`${preview.size}rem`} align={preview.align} />
            </li>
          ))}
        </Stack>
      ) : (
        <Grid minColumnWidth={vars.sizes.itemCard.minWidth[gridSize]} ariaLabel={label}>
          {items.map((item) => (
            <li key={item.id}>
              <Link to={itemPath(item.id)} className={styles.fontCard}>
                <FontSample family={item.font?.family} text={sampleFor(item)} size={vars.typography.fontSize.xxl} align={preview.align} maxLines={3} />
                <Text variant="title" autoDirection maxLines={1}>
                  {item.title[locale]}
                </Text>
                <Text variant="bodySm" color={vars.colors.textMuted}>
                  {fillText(text.item.by, { creator: item.creator.name })}
                </Text>
              </Link>
            </li>
          ))}
        </Grid>
      )}
    </Stack>
  );
};
