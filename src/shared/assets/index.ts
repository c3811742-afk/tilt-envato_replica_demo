// Asset registry: import every image, icon and logo here and use it through `assets`, never by file path.
import { icons, directionalIcons } from './icons/icons';
import { logos } from './logos/logos';
import { itemImageCredits, itemImages } from './images/items';

export const assets = { icons, directionalIcons, logos, itemImages, itemImageCredits } as const;

export type { IconName } from './icons/icons';
export type { BrandLogoName, BrandLogoDefinition } from './logos/logos';
