import { catalog, creatorPath, searchPath } from '@/shared/constants';
import { useLocale } from '@/shared/hooks';
import type { Item } from '@/shared/types';
import { api, fillText } from '@/shared/utils';
import { ItemRowSection } from '@/features/customer/components';

// Under the item: more by the same creator, items often downloaded with it, and similar items.
// A row with nothing in it isn't shown.
export const RelatedItems = ({ item }: { item: Item }) => {
  const { text } = useLocale();
  return (
    <>
      <ItemRowSection
        title={fillText(text.item.moreBy, { creator: item.creator.name })}
        load={() => api.getCreatorItems(item.creator.id, { excludeId: item.id, limit: catalog.moreByCreatorSize }).then((page) => page.items)}
        deps={[item.id]}
        actionLabel={text.item.viewProfile}
        actionTo={creatorPath(item.creator.id)}
        hideWhenEmpty
      />
      <ItemRowSection title={text.item.downloadedTogether} load={() => api.getDownloadedTogether(item)} deps={[item.id]} hideWhenEmpty />
      <ItemRowSection
        title={text.item.similarTitle}
        load={() => api.getSimilarItems(item)}
        deps={[item.id]}
        actionLabel={text.common.viewAll}
        actionTo={searchPath({ category: item.categoryId })}
        hideWhenEmpty
      />
    </>
  );
};
