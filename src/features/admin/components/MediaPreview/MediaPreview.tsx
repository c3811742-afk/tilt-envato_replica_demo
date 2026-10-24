import { useState, type CSSProperties } from 'react';
import { Text } from '@/shared/components';
import { useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { withDefaults } from '@/shared/utils';
import { mediaPreviewDefaults } from './MediaPreview.defaults';
import type { MediaPreviewProps } from './MediaPreview.types';
import styles from './MediaPreview.module.css';

// Shows an image, a video player or an audio player. Falls back to a placeholder when there's nothing to show.
export const MediaPreview = (props: MediaPreviewProps) => {
  const { kind, src, alt, aspectRatio, background, emptyLabel } = withDefaults(mediaPreviewDefaults, props);
  const { text } = useLocale();
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const showMedia = Boolean(src) && failedSrc !== src;
  const onError = () => setFailedSrc(src ?? null);

  const style = {
    '--media-preview-aspect-ratio': aspectRatio,
    '--media-preview-background': background,
  } as CSSProperties;

  return (
    <div className={styles.preview} style={style}>
      {!showMedia && <Text color={vars.colors.textMuted}>{emptyLabel ?? text.admin.common.noPreview}</Text>}
      {showMedia && kind === 'image' && <img className={styles.media} src={src} alt={alt ?? ''} onError={onError} />}
      {showMedia && kind === 'video' && (
        <video className={styles.media} src={src} aria-label={alt} controls preload="metadata" onError={onError} />
      )}
      {showMedia && kind === 'audio' && (
        <audio className={styles.audio} src={src} aria-label={alt} controls preload="metadata" onError={onError} />
      )}
    </div>
  );
};
