import { Badge, Card, Checkbox, Icon, Stack, Text } from '@/shared/components';
import { useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import type { UserCollection } from '@/shared/types';
import { fillText, formatNumber } from '@/shared/utils';

interface UserCollectionCardProps {
  collection: UserCollection;
  to: string; // the collection's page
  childCount?: number; // collections inside it
  selecting?: boolean; // select mode: the card is a checkbox instead of a link
  selected?: boolean;
  onToggle?: (selected: boolean) => void;
}

// One of the user's collections in a list: its name, how many items, pinned and shared marks.
export const UserCollectionCard = ({ collection, to, childCount = 0, selecting = false, selected = false, onToggle }: UserCollectionCardProps) => {
  const { text, locale } = useLocale();
  const count = collection.itemIds.length + collection.uploads.length;

  const content = (
    <Stack gap={vars.spacing[3]}>
      <Stack direction="row" align="center" justify="space-between" gap={vars.spacing[2]}>
        <Icon name="folder" size={vars.sizes.icon.lg} color={vars.colors.primary} filled={selected} />
        <Stack direction="row" gap={vars.spacing[2]}>
          {collection.pinned && <Badge variant="highlight">{text.myCollections.pinned}</Badge>}
          {collection.shareId && <Icon name="share" size={vars.sizes.icon.sm} label={text.myCollections.share} />}
        </Stack>
      </Stack>
      <Text as="h3" variant="title" autoDirection maxLines={2}>
        {collection.name}
      </Text>
      <Text variant="bodySm" color={vars.colors.textMuted}>
        {[
          fillText(text.myCollections.itemCount, { count: formatNumber(count, locale) }),
          childCount > 0 ? fillText(text.myCollections.childCount, { count: formatNumber(childCount, locale) }) : null,
        ]
          .filter(Boolean)
          .join(' · ')}
      </Text>
    </Stack>
  );

  if (selecting) {
    return (
      <Card as="li" padding={vars.spacing[4]} borderColor={selected ? vars.colors.primary : vars.colors.border}>
        <Checkbox label={content} checked={selected} onChange={(checked) => onToggle?.(checked)} />
      </Card>
    );
  }

  return (
    <li>
      <Card to={to} padding={vars.spacing[4]}>
        {content}
      </Card>
    </li>
  );
};
