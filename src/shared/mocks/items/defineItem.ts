import type { AccentName } from '@/shared/theme';
import { assets } from '@/shared/assets';
import type { Item } from '@/shared/types';
import { itemVisuals } from './itemVisuals';

const megabyte = 1024 * 1024;

// Each item gets one of the accents from its id, so neighbouring cards look different and never change.
const accents: AccentName[] = ['royalBlue', 'yellow', 'hotPink', 'mint', 'red', 'lime', 'purple', 'orange', 'skyBlue', 'forest'];
const accentFor = (id: string) =>
  accents[[...id].reduce((hash, char) => (hash * 31 + char.charCodeAt(0)) % 9973, 7) % accents.length];

// What a mock item is written with: the rest (accent, image, color, flags that are usually off) is filled in.
export type ItemInput = Omit<
  Item,
  'accent' | 'fileSize' | 'image' | 'imageCredit' | 'color' | 'look' | 'featured' | 'bilingual' | 'local' | 'occasions' | 'businesses'
> &
  Partial<Pick<Item, 'featured' | 'bilingual' | 'local' | 'occasions' | 'businesses'>> & {
    sizeMb: number;
  };

export const defineItem = ({ sizeMb, ...input }: ItemInput): Item => ({
  featured: false,
  bilingual: false,
  local: false,
  occasions: [],
  businesses: [],
  ...input,
  accent: accentFor(input.id),
  fileSize: Math.round(sizeMb * megabyte),
  image: assets.itemImages[input.id],
  imageCredit: assets.itemImageCredits[input.id],
  ...itemVisuals[input.id],
});
