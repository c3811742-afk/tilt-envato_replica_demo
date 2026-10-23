import type { CSSProperties } from 'react';
import type { IconName } from '@/shared/assets';
import { vars } from '@/shared/theme';
import { cx, withDefaults } from '@/shared/utils';
import { FontSample } from '../FontSample';
import { Icon } from '../Icon';
import { Text } from '../Text';
import { coverShapes, itemCoverDefaults } from './ItemCover.defaults';
import type { ItemCoverProps } from './ItemCover.types';
import styles from './ItemCover.module.css';

// Same seed, same shape: sums the character codes so a cover never changes between visits.
const shapeFor = (seed: string) =>
  coverShapes[[...seed].reduce((sum, char) => sum + char.charCodeAt(0), 0) % coverShapes.length];

// An item's cover: its preview image, a font's letters, or generated flat cover art (accent color, bold shape, category icon).
export const ItemCover = (props: ItemCoverProps) => {
  const { image, accent, icon, title, showTitle, seed, aspectRatio, label, sample, previewOnHover, fill } = withDefaults(itemCoverDefaults, props);
  const colors = vars.accentPairs[accent];

  const style = {
    '--cover-background': colors.bg,
    '--cover-color': colors.text,
    '--cover-ratio': aspectRatio,
  } as CSSProperties;

  const art = () => {
    if (image) return <img className={styles.image} src={image} alt="" loading="lazy" decoding="async" />;
    if (sample) {
      return (
        <span className={styles.sample} aria-hidden={label ? true : undefined}>
          <FontSample family={sample.family} text={sample.text} size={vars.typography.fontSize.display} color={colors.text} align="center" maxLines={1} />
        </span>
      );
    }
    return (
      <GeneratedArt icon={icon} title={showTitle ? title : undefined} seed={seed || title || ''} color={colors.text} labelled={Boolean(label)} />
    );
  };

  return (
    <div className={cx(styles.cover, previewOnHover && styles.preview, fill && styles.fill)} style={style} role={label ? 'img' : undefined} aria-label={label}>
      {art()}
      {previewOnHover && <span className={styles.progress} aria-hidden="true" />}
    </div>
  );
};

interface GeneratedArtProps {
  icon: IconName;
  title?: string; // printed on the cover
  seed: string;
  color: string; // readable on the accent background
  labelled: boolean; // the cover already has an accessible name, so the title is hidden from screen readers
}

// The cover drawn from the theme when an item has no preview image.
const GeneratedArt = ({ icon, title, seed, color, labelled }: GeneratedArtProps) => (
  <>
    <span className={cx(styles.shape, styles[shapeFor(seed)])} aria-hidden="true" />
    <span className={styles.icon} aria-hidden="true">
      <Icon name={icon} size={vars.sizes.cover.icon} />
    </span>
    {title && (
      <span className={styles.title} aria-hidden={labelled ? true : undefined}>
        <Text as="span" variant="h2" color={color} maxLines={3} autoDirection>
          {title}
        </Text>
      </span>
    )}
  </>
);
