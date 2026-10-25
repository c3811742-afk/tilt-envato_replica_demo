import type { StudioElement, StudioFile } from '@/shared/types';
import { fileStore } from './fileStore';
import { readStudioElements } from './studioStore';

// Creators' preview files are kept in the browser's file store. Each one gets a link here once, so pages can show it
// like any other image or video (cards, the item page, the admin review).
const urls = new Map<string, string>();

export const studioFileUrl = (file: StudioFile | undefined) => (file ? urls.get(file.id) : undefined);

// An element's first preview of a kind ('image', 'video' or 'audio'), with its link once it's loaded.
export const studioPreview = (element: Pick<StudioElement, 'previews'>, kind: 'image' | 'video' | 'audio') => {
  const file = element.previews.find((preview) => preview.type.startsWith(`${kind}/`));
  const url = studioFileUrl(file);
  return file && url ? { file, url } : undefined;
};

// Loads every preview that has no link yet. A file that's missing or can't be read is skipped (and logged): the
// element keeps its generated cover.
export const loadStudioPreviews = async () => {
  const files = readStudioElements()
    .flatMap((element) => [...element.previews, ...(element.liveVersion?.previews ?? [])])
    .filter((file) => !urls.has(file.id));
  await Promise.all(
    files.map(async (file) => {
      try {
        const blob = await fileStore.get(file.id);
        if (blob) urls.set(file.id, URL.createObjectURL(blob));
      } catch (error) {
        console.error(error);
      }
    }),
  );
};
