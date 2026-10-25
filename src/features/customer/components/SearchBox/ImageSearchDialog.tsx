import { useState } from 'react';
import { useNavigate } from 'react-router';
import { AsyncContent, FileInput, Grid, ItemCover, Modal, Stack, stateMessageHeights, Text } from '@/shared/components';
import { catalog, categoryIcons, searchPath } from '@/shared/constants';
import { useAsync, useLocale, useSearchFilters } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { api, fillText, formatFileSize, measureImageLook, safeAsync } from '@/shared/utils';
import styles from './SearchBox.module.css';

interface ImageSearchDialogProps {
  open: boolean;
  onClose: () => void;
}

const imageTypes = 'image/jpeg,image/png,image/webp';

// Search by image: upload one, or pick one of the catalog's images. Results look alike (colors and layout).
export const ImageSearchDialog = ({ open, onClose }: ImageSearchDialogProps) => {
  const search = useSearchFilters();
  const { text, locale } = useLocale();
  const navigate = useNavigate();
  const [reading, setReading] = useState(false);
  const [error, setError] = useState<string>();
  const references = useAsync(
    () => api.getItems('popular', catalog.referenceImages * 2).then((items) => items.filter((item) => item.look).slice(0, catalog.referenceImages)),
    [],
  );
  const maxSize = formatFileSize(catalog.uploadLimits.imageBytes, locale);

  // A new search: only the category is kept.
  const searchWith = (look: string) => {
    onClose();
    navigate(searchPath({ category: search.categoryId, look }));
  };

  const upload = async (file: File) => {
    setError(undefined);
    if (!file.type.startsWith('image/')) return setError(text.imageSearch.invalid);
    if (file.size > catalog.uploadLimits.imageBytes) return setError(fillText(text.imageSearch.tooLarge, { size: maxSize }));
    setReading(true);
    const result = await safeAsync(() => measureImageLook(file));
    setReading(false);
    if (!result.ok) return setError(text.imageSearch.invalid);
    searchWith(result.data);
  };

  return (
    <Modal open={open} onClose={onClose} title={text.imageSearch.title}>
      <FileInput
        label={text.imageSearch.upload}
        accept={imageTypes}
        icon="upload"
        variant="primary"
        busy={reading ? text.imageSearch.reading : undefined}
        hint={fillText(text.imageSearch.uploadHint, { size: maxSize })}
        error={error}
        onSelect={upload}
      />
      <Stack gap={vars.spacing[2]}>
        <Text variant="title">{text.imageSearch.pick}</Text>
        <AsyncContent state={references} minHeight={stateMessageHeights.compact}>
          {(items) => (
            <Grid minColumnWidth={vars.sizes.thumbnail} gap={vars.spacing[2]} ariaLabel={text.imageSearch.pick}>
              {items.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    className={styles.reference}
                    aria-label={fillText(text.imageSearch.useImage, { title: item.title[locale] })}
                    title={item.title[locale]}
                    onClick={() => item.look && searchWith(item.look)}
                  >
                    <ItemCover image={item.image} accent={item.accent} icon={categoryIcons[item.categoryId]} seed={item.id} aspectRatio={vars.sizes.aspectRatio.square} />
                  </button>
                </li>
              ))}
            </Grid>
          )}
        </AsyncContent>
      </Stack>
    </Modal>
  );
};
