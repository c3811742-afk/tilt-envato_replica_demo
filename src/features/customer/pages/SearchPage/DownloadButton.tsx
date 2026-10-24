import { Button, Icon } from '@/shared/components';
import { useLocale } from '@/shared/hooks';
import type { Item } from '@/shared/types';
import { vars } from '@/shared/theme';
import { ItemDownload } from '@/features/customer/components';

// A small Download button for a result row (tracks, fonts).
export const DownloadButton = ({ item }: { item: Item }) => {
  const { text } = useLocale();
  return (
    <ItemDownload
      item={item}
      trigger={(open) => (
        <Button size="sm" onClick={open}>
          <Icon name="download" size={vars.sizes.icon.sm} />
          {text.item.download}
        </Button>
      )}
    />
  );
};
