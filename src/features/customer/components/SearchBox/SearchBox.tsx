import { useState } from 'react';
import { SearchBar, type SearchBarProps } from '@/shared/components';
import { useLocale } from '@/shared/hooks';
import { AdvancedSearchDialog } from './AdvancedSearchDialog';
import { ImageSearchDialog } from './ImageSearchDialog';
import { MusicMatchDialog } from './MusicMatchDialog';

type SearchTool = 'advanced' | 'image' | 'music';

// The site's search box with its tools as icons inside it, like other search sites:
// advanced search, search by image and find similar music. Each opens its dialog.
export const SearchBox = (props: Omit<SearchBarProps, 'actions'>) => {
  const { text } = useLocale();
  const [tool, setTool] = useState<SearchTool | null>(null);
  const close = () => setTool(null);

  return (
    <>
      <SearchBar
        {...props}
        actions={[
          { icon: 'filter', label: text.search.advanced, onClick: () => setTool('advanced') },
          { icon: 'camera', label: text.search.byImage, onClick: () => setTool('image') },
          { icon: 'music', label: text.search.similarMusic, onClick: () => setTool('music') },
        ]}
      />
      <AdvancedSearchDialog open={tool === 'advanced'} onClose={close} />
      <ImageSearchDialog open={tool === 'image'} onClose={close} />
      <MusicMatchDialog open={tool === 'music'} onClose={close} />
    </>
  );
};
