import { useMemo } from 'react';
import { Link } from 'react-router';
import { categoryIcons, fontSpecimen, itemPath, previewKinds } from '@/shared/constants';
import { useItemActions, useLocale, usePlayback, useStopOnUnmount } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import type { Item } from '@/shared/types';
import { cx, fillText, formatCompactNumber, formatNumber, previewSource, withDefaults } from '@/shared/utils';
import { Icon } from '../Icon';
import { ItemCover } from '../ItemCover';
import { PlayButton } from '../PlayButton';
import { Text } from '../Text';
import { TierBadge } from '../TierBadge';
import { itemCardDefaults } from './ItemCard.defaults';
import type { ItemCardProps } from './ItemCard.types';
import styles from './ItemCard.module.css';

// One item in a grid or row. The picture takes most of the card (at least 70% of its height);
// under it, a line each for the title, the creator, and the rating and downloads. Opens the item page.
// Videos preview on hover; music and sound effects have a play button on the cover. The app's item actions
// (favorite, save to collection) sit at the end of the rating line, outside the link, so the picture stays clear.
export const ItemCard = (props: ItemCardProps) => {
  const { item, headingLevel, showCategory, preview } = withDefaults(itemCardDefaults, props);
  const appActions = useItemActions();
  const actions = props.actions ?? appActions?.(item);
  const { text, locale } = useLocale();
  const kind = previewKinds[item.categoryId];
  const title = item.title[locale];

  return (
    <article className={styles.card}>
      <Link to={itemPath(item.id)} className={styles.link}>
        <div className={styles.cover}>
          <ItemCover
            image={item.image}
            accent={item.accent}
            icon={categoryIcons[item.categoryId]}
            seed={item.id}
            sample={item.font && { family: item.font.family, text: item.font.arabic ? `${fontSpecimen.latin} ${fontSpecimen.arabic}` : fontSpecimen.latin }}
            previewOnHover={preview && kind === 'video'}
            fill
          />
          <span className={styles.tier}>
            <TierBadge tier={item.tier} />
          </span>
        </div>
        <div className={cx(styles.body, actions != null && styles.withActions)}>
          <Text as={headingLevel} variant="title" maxLines={1} autoDirection>
            {title}
          </Text>
          <Text variant="bodySm" color={vars.colors.textMuted} maxLines={1}>
            {showCategory ? text.categories[item.categoryId].name : fillText(text.item.by, { creator: item.creator.name })}
          </Text>
          <div className={styles.meta}>
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
      {actions && <div className={styles.actions}>{actions}</div>}
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
