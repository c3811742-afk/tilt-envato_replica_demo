import type { Locale } from '@/shared/theme';

// Text the admin writes in both site languages (category names, FAQ answers, banners...).
export type LocalizedText = Record<Locale, string>;

export type AttributeType = 'single' | 'multiple' | 'boolean' | 'range';

// A property of elements in a category (e.g. "Orientation" for photos). Can be shown as a search filter.
export interface CategoryAttribute {
  id: string;
  name: LocalizedText;
  type: AttributeType;
  options: string[]; // only for 'single' and 'multiple'
  isFilter: boolean;
}

// A category or, with a parentId, a subcategory. Siblings are shown in list order.
export interface Category {
  id: string;
  name: LocalizedText;
  parentId: string | null;
  hidden: boolean;
  attributes: CategoryAttribute[];
}

export interface CategoryInput {
  name: LocalizedText;
  parentId: string | null;
}

export type AttributeInput = Omit<CategoryAttribute, 'id'>;

export type MoveDirection = 'up' | 'down';

export interface Tag {
  id: string;
  name: string;
  banned: boolean;
  usage: number; // how many elements use it
}

export type DeprecateReason = 'noDownloads' | 'outdatedStyle' | 'outdatedSoftware' | 'replaced';

export interface DeprecateInput {
  reason: DeprecateReason;
  note: string;
}
