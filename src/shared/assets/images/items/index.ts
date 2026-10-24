import type { AssetCredit } from '@/shared/types';
import { itemImageCredits } from './credits';

// Every item preview image in this folder, by item id (the file name). Vite adds them to the build.
const files = import.meta.glob<string>('./*.jpg', { eager: true, import: 'default', query: '?url' });

export const itemImages: Record<string, string> = Object.fromEntries(
  Object.entries(files).map(([path, url]) => [path.replace('./', '').replace('.jpg', ''), url]),
);

export { itemImageCredits };
export type ItemImageCredits = Record<string, AssetCredit>;
