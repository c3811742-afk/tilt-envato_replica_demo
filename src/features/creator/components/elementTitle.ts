import type { StudioElement } from '@/shared/types';

// The element's title in the language it was written in (a fresh upload may have none yet).
export const elementTitle = (element: StudioElement, untitled: string) => element.title[element.language] || untitled;
