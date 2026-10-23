import { useEffect, useState } from 'react';
import { Button, Card, Icon, Stack, Text } from '@/shared/components';
import { useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import type { UploadRef } from '@/shared/types';
import { fileStore, formatFileSize, safeAsync } from '@/shared/utils';
import styles from './UploadTile.module.css';

const kindIcons = { image: 'image', video: 'video', audio: 'music' } as const;

// One of the user's own reference files in a collection: a preview from the browser's file store, its name and size.
export const UploadTile = ({ upload, onRemove }: { upload: UploadRef; onRemove?: () => void }) => {
  const { text, locale } = useLocale();
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let objectUrl: string | null = null;
    let active = true;
    void safeAsync(() => fileStore.get(upload.id)).then((result) => {
      // A file missing from this browser (e.g. cleared site data) just shows its icon instead of a preview.
      if (!result.ok) console.error(result.error);
      if (!active || !result.ok || !result.data) return;
      objectUrl = URL.createObjectURL(result.data);
      setUrl(objectUrl);
    });
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [upload.id]);

  return (
    <Card as="li" padding={vars.spacing[3]} gap={vars.spacing[3]}>
      <div className={styles.preview}>
        {url && upload.kind === 'image' && <img src={url} alt={upload.name} className={styles.media} />}
        {url && upload.kind === 'video' && <video src={url} controls className={styles.media} aria-label={upload.name} />}
        {url && upload.kind === 'audio' && <audio src={url} controls className={styles.audio} aria-label={upload.name} />}
        {!url && <Icon name={kindIcons[upload.kind]} size={vars.sizes.icon.xl} color={vars.colors.textMuted} />}
      </div>
      <Stack direction="row" align="center" justify="space-between" gap={vars.spacing[2]}>
        <Stack gap={vars.spacing[1]}>
          <Text variant="title" autoDirection maxLines={1}>
            {upload.name}
          </Text>
          <Text variant="bodySm" color={vars.colors.textMuted}>
            {text.myCollections.uploadKinds[upload.kind]} · {formatFileSize(upload.size, locale)}
          </Text>
        </Stack>
        {onRemove && (
          <Button variant="outline" size="sm" onClick={onRemove} ariaLabel={`${text.myCollections.removeFromCollection} ${upload.name}`}>
            <Icon name="trash" size={vars.sizes.icon.sm} />
          </Button>
        )}
      </Stack>
    </Card>
  );
};
