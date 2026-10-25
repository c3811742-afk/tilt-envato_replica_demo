import { useState, type CSSProperties } from 'react';
import { useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { cx, withDefaults } from '@/shared/utils';
import { Text } from '../Text';
import { mediaPreviewDefaults } from './MediaPreview.defaults';
import type { MediaPreviewProps } from './MediaPreview.types';
import styles from './MediaPreview.module.css';

// An image, a video player or an audio player, with a placeholder when there's nothing to show
// (no file, or one that fails to load). Used for uploads in collections and for elements in review.
export const MediaPreview = (props: MediaPreviewProps) => {
  const { kind, src, alt, aspectRatio, background, fit, border, placeholder } = withDefaults(mediaPreviewDefaults, props);
  const { text } = useLocale();
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const showMedia = Boolean(src) && failedSrc !== src;
  const onError = () => setFailedSrc(src ?? null);

  const style = {
    '--media-preview-aspect-ratio': aspectRatio,
    '--media-preview-background': background,
    '--media-preview-fit': fit,
  } as CSSProperties;

  return (
    <div className={cx(styles.preview, border && styles.bordered)} style={style}>
      {!showMedia && (placeholder ?? <Text color={vars.colors.textMuted}>{text.common.noPreview}</Text>)}
      {showMedia && kind === 'image' && <img className={styles.media} src={src} alt={alt ?? ''} onError={onError} />}
      {showMedia && kind === 'video' && <video className={styles.media} src={src} aria-label={alt} controls preload="metadata" onError={onError} />}
      {showMedia && kind === 'audio' && <audio className={styles.audio} src={src} aria-label={alt} controls preload="metadata" onError={onError} />}
    </div>
  );
};
