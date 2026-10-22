import { useMemo } from 'react';
import { Link } from 'react-router';
import { categoryIcons, fontSpecimen, itemPath, previewKinds } from '@/shared/constants';
import { useLocale, usePlayback, useStopOnUnmount } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import type { Item } from '@/shared/types';
import { fillText, formatCompactNumber, formatNumber, previewSource, withDefaults } from '@/shared/utils';
import { Icon } from '../Icon';
import { ItemCover } from '../ItemCover';
import { PlayButton } from '../PlayButton';
import { Text } from '../Text';
import { TierBadge } from '../TierBadge';
import { itemCardDefaults } from './ItemCard.defaults';
import type { ItemCardProps } from './ItemCard.types';
import styles from './ItemCard.module.css';

// One item in a grid or row: cover, title, creator, tier, rating and downloads. Opens the item page.
// Videos preview on hover; music and sound effects have a play button on the cover.
export const ItemCard = (props: ItemCardProps) => {
  const { item, headingLevel, showCategory, preview } = withDefaults(itemCardDefaults, props);
  const { text, locale } = useLocale();
  const kind = previewKinds[item.categoryId];
  const title = item.title[locale];

  return (
    <article className={styles.card}>
      <Link to={itemPath(item.id)} className={styles.link}>
        <ItemCover
          image={item.image}
          accent={item.accent}
          icon={categoryIcons[item.categoryId]}
          seed={item.id}
          sample={item.font && { family: item.font.family, text: item.font.arabic ? `${fontSpecimen.latin} ${fontSpecimen.arabic}` : fontSpecimen.latin }}
          previewOnHover={preview && kind === 'video'}
        />
        <div className={styles.body}>
          {showCategory && (
            <Text variant="label" color={vars.colors.textMuted}>
              {text.categories[item.categoryId].name}
            </Text>
          )}
          <Text as={headingLevel} variant="title" maxLines={2} autoDirection>
            {title}
          </Text>
          <Text variant="bodySm" color={vars.colors.textMuted} maxLines={1}>
            {fillText(text.item.by, { creator: item.creator.name })}
          </Text>
          <div className={styles.meta}>
            <TierBadge tier={item.tier} />
            <span className={styles.stat}>
              <Icon name="star" filled size={vars.sizes.icon.sm} label={text.item.rating} />
              <Text as="span" variant="bodySm">
                {formatNumber(item.rating, locale)}
              </Text>
            </span>
            <span className={styles.stat}>
              <Icon name="download" size={vars.sizes.icon.sm} label={text.item.downloads} />
              <Text as="span" variant="bodySm">
                {formatCompactNumber(item.downloads, locale)}
              </Text>
            </span>
          </div>
        </div>
      </Link>
      {preview && kind === 'audio' && <CardPlayButton item={item} title={title} />}
    </article>
  );
};

// Plays a music or sound effect preview right from the card (outside the link, so it doesn't open the item).
const CardPlayButton = ({ item, title }: { item: Item; title: string }) => {
  const { text } = useLocale();
  const source = useMemo(() => previewSource(item), [item]);
  const player = usePlayback(source);
  useStopOnUnmount(source.id);
  const playing = player.status === 'playing';

  return (
    <span className={styles.play}>
      <PlayButton
        status={player.status}
        label={fillText(playing ? text.player.pauseTitle : text.player.playTitle, { title })}
        title={playing ? text.player.pause : text.player.play}
        onClick={player.toggle}
      />
    </span>
  );
};
