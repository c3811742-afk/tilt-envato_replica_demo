import type { CSSProperties } from 'react';
import { vars } from '@/shared/theme';
import { cx, withDefaults } from '@/shared/utils';
import { ItemCover } from '../ItemCover';
import { Text } from '../Text';
import { titleTiming, videoStageDefaults } from './VideoStage.defaults';
import type { VideoStageProps } from './VideoStage.types';
import styles from './VideoStage.module.css';

// The picture of a video preview: the item's image slowly zooms and drifts as the preview plays,
// with the template's title or the tutorial's step on top.
export const VideoStage = (props: VideoStageProps) => {
  const { image, accent, icon, seed, progress, title, caption, step, aspectRatio } = withDefaults(videoStageDefaults, props);
  const titleVisible = progress > titleTiming.in && progress < titleTiming.out;
  const style = { '--stage-progress': progress, '--stage-ratio': aspectRatio } as CSSProperties;

  return (
    <div className={styles.stage} style={style}>
      <div className={styles.picture}>
        <ItemCover image={image} accent={accent} icon={icon} seed={seed} aspectRatio={aspectRatio} />
      </div>
      {title && (
        <div className={cx(styles.title, titleVisible && styles.visible)} aria-hidden="true">
          <Text as="span" variant="display" color={vars.colors.textInverse} maxLines={2} autoDirection>
            {title}
          </Text>
        </div>
      )}
      {caption && (
        <div className={styles.caption}>
          {step && (
            <Text as="span" variant="label" color={vars.colors.onHighlight}>
              {step}
            </Text>
          )}
          <Text as="span" variant="h4" color={vars.colors.onHighlight}>
            {caption}
          </Text>
        </div>
      )}
    </div>
  );
};
