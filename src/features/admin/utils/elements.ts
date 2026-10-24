import type { MediaKind } from '@/shared/components';
import type { CatalogElement, ElementType } from '@/features/admin/types';
import { matchesText } from '@/shared/utils';

const previewKinds: Record<ElementType, MediaKind> = {
  photo: 'image',
  video: 'video',
  videoTemplate: 'video',
  music: 'audio',
  soundEffect: 'audio',
  graphic: 'image',
  font: 'image',
  presentation: 'image',
};

// How an element type is previewed: an image, a video player or an audio player.
export const previewKind = (type: ElementType) => previewKinds[type];

export const elementMatchesQuery = (element: CatalogElement, query: string) =>
  matchesText(query, ...[element.title, element.creator.name]);

export interface QueueFilters {
  query: string;
  type: ElementType | 'all';
  flaggedOnly: boolean;
}

export const filterQueue = (elements: CatalogElement[], { query, type, flaggedOnly }: QueueFilters) =>
  elements.filter(
    (element) =>
      elementMatchesQuery(element, query) &&
      (type === 'all' || element.type === type) &&
      (!flaggedOnly || Boolean(element.flag)),
  );

export const totalFileSize = (element: CatalogElement) =>
  element.files.reduce((total, file) => total + file.sizeBytes, 0);
