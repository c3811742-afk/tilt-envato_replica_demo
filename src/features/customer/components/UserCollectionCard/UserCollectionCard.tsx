import { Link } from 'react-router';
import { Badge, Icon, ItemCover, Text } from '@/shared/components';
import { categoryIcons } from '@/shared/constants';
import { useAsync, useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import type { UserCollection } from '@/shared/types';
import { api, cx, formatCount } from '@/shared/utils';
import styles from './UserCollectionCard.module.css';

const mosaicSize = 4; // items shown on the cover

interface UserCollectionCardProps {
  collection: UserCollection;
  to: string; // the collection's page
  childCount?: number; // collections inside it
  selecting?: boolean; // select mode: clicking the card selects it instead of opening it
  selected?: boolean;
  onToggle?: (selected: boolean) => void;
}

// One of the user's collections, the same shape and size as an item card so the two sit together in one grid:
// a square cover (its first items, or a folder), then its name, how many items, and pinned / shared marks.
export const UserCollectionCard = ({ collection, to, childCount = 0, selecting = false, selected = false, onToggle }: UserCollectionCardProps) => {
  const { text, locale } = useLocale();
  const count = collection.itemIds.length + collection.uploads.length;
  const counts = [
    formatCount(text.myCollections.itemCount, count, locale),
    childCount > 0 ? formatCount(text.myCollections.childCount, childCount, locale) : null,
  ]
    .filter(Boolean)
    .join(' · ');

  const content = (
    <>
      <div className={styles.cover}>
        <CollectionCover collection={collection} />
        {selecting && (
          <span className={cx(styles.check, selected && styles.checked)} aria-hidden="true">
            {selected && <Icon name="check" size={vars.sizes.icon.sm} />}
          </span>
        )}
      </div>
      <div className={styles.body}>
        <Text as="h3" variant="title" autoDirection maxLines={1}>
          {collection.name}
        </Text>
        <Text variant="bodySm" color={vars.colors.textMuted} maxLines={1}>
          {counts}
        </Text>
        <div className={styles.meta}>
          <Icon name="folder" size={vars.sizes.icon.sm} color={vars.colors.textMuted} label={text.myCollections.title} />
          {collection.pinned && <Badge variant="highlight">{text.myCollections.pinned}</Badge>}
          {collection.shareId && <Icon name="share" size={vars.sizes.icon.sm} label={text.myCollections.share} />}
        </div>
      </div>
    </>
  );

  return (
    <li>
      {selecting ? (
        <button
          type="button"
          className={cx(styles.tile, selected && styles.selected)}
          aria-pressed={selected}
          onClick={() => onToggle?.(!selected)}
        >
          {content}
        </button>
      ) : (
        <Link to={to} className={styles.tile}>
          {content}
        </Link>
      )}
    </li>
  );
};

// The cover: the collection's first items in a 2 x 2 grid (or the only one, full size). An empty collection,
// or one whose items can't be loaded, gets a folder cover. Each card loads its own few items.
const CollectionCover = ({ collection }: { collection: UserCollection }) => {
  const ids = collection.itemIds.slice(0, mosaicSize);
  const items = useAsync(() => api.getItemsByIds(ids), [ids.join()], () => false);
  const loaded = items.status === 'success' ? items.data : [];

  if (loaded.length === 0) return <ItemCover accent="royalBlue" icon="folder" seed={collection.id} fill />;
  return (
    <div className={cx(styles.mosaic, loaded.length > 1 && styles.mosaicGrid)}>
      {loaded.map((item) => (
        <ItemCover key={item.id} image={item.image} accent={item.accent} icon={categoryIcons[item.categoryId]} seed={item.id} fill />
      ))}
    </div>
  );
};
