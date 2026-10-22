import { TrackRow } from '@/shared/components';
import { useLocale } from '@/shared/hooks';
import type { Item } from '@/shared/types';

// A music item's alternate versions and loops, each playable on its own.
export const TrackVersions = ({ item }: { item: Item }) => {
  const { text } = useLocale();
  return (
    <ul aria-label={text.item.versions}>
      {item.music?.versions.map((version) => (
        <TrackRow key={version.kind} item={item} version={version.kind} showVersions={false} />
      ))}
    </ul>
  );
};
