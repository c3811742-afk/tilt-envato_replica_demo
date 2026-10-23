import type { CSSProperties } from 'react';
import { categoryIcons, collectionPath } from '@/shared/constants';
import { useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { fillText, formatNumber, withDefaults } from '@/shared/utils';
import { Badge } from '../Badge';
import { Card } from '../Card';
import { ItemCover } from '../ItemCover';
import { Text } from '../Text';
import { collectionCardDefaults, mosaicSize } from './CollectionCard.defaults';
import type { CollectionCardProps } from './CollectionCard.types';
import styles from './CollectionCard.module.css';

// A collection or a creator / partner drop: a mosaic of its items, its name and who it's from.
export const CollectionCard = (props: CollectionCardProps) => {
  const { collection, headingLevel } = withDefaults(collectionCardDefaults, props);
  const { text, locale } = useLocale();
  const from = collection.partner
    ? fillText(text.collections.byPartner, { partner: collection.partner })
    : collection.creator
      ? fillText(text.collections.byCreator, { creator: collection.creator.name })
      : text.collections.byTeam;

  return (
    <Card as="li" to={collectionPath(collection.id)} padding={vars.spacing[0]} gap={vars.spacing[0]}>
      <div className={styles.mosaic} style={{ '--collection-accent': vars.accentPairs[collection.accent].bg } as CSSProperties}>
        {collection.items.slice(0, mosaicSize).map((item) => (
          <ItemCover
            key={item.id}
            image={item.image}
            accent={item.accent}
            icon={categoryIcons[item.categoryId]}
            seed={item.id}
            aspectRatio={vars.sizes.aspectRatio.video}
          />
        ))}
      </div>
      <div className={styles.body}>
        <Badge variant={collection.kind === 'drop' ? 'highlight' : 'neutral'}>{text.collections.kinds[collection.kind]}</Badge>
        <Text as={headingLevel} variant="h4" autoDirection>
          {collection.title[locale]}
        </Text>
        <Text variant="bodySm" color={vars.colors.textMuted} maxLines={2}>
          {collection.description[locale]}
        </Text>
        <Text variant="label" color={vars.colors.textMuted}>
          {from}
        </Text>
        <Text variant="label" color={vars.colors.textMuted}>
          {fillText(text.collections.itemCount, { count: formatNumber(collection.items.length, locale) })}
        </Text>
      </div>
    </Card>
  );
};
