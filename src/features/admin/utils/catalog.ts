import type {
  Banner,
  Category,
  LocalizedText,
  Occasion,
  Program,
  ProgramStatus,
  ScheduleStatus,
} from '@/features/admin/types';
import type { Text } from '@/shared/constants';
import type { Locale } from '@/shared/theme';
import { isShowingOn } from '@/shared/utils';

// Text written in both languages, in the page's language. Falls back to the other one if it's still empty.
export const localized = (value: LocalizedText, locale: Locale) => value[locale] || value.en || value.ar;

export const emptyLocalized = (): LocalizedText => ({ en: '', ar: '' });

export interface CategoryBranch {
  category: Category;
  children: Category[];
}

// Top-level categories, each with its subcategories, both in display order.
export const categoryTree = (categories: Category[]): CategoryBranch[] =>
  categories
    .filter((category) => !category.parentId)
    .map((category) => ({
      category,
      children: categories.filter((child) => child.parentId === category.id),
    }));

// "Portrait, Landscape, Square" -> ['Portrait', 'Landscape', 'Square']
export const parseOptions = (value: string) =>
  value
    .split(/[,،]/)
    .map((option) => option.trim())
    .filter(Boolean);

// The messages to show under a start and end date field, or none when the range is fine.
export const dateRangeErrors = ({ from = '', to = '' }: { from?: string; to?: string }, text: Text) => ({
  from: from ? undefined : text.admin.common.dateRequired,
  to: !to ? text.admin.common.dateRequired : from && to < from ? text.admin.common.datesOrder : undefined,
});

// "Enter the English text." / "Enter the Arabic text." under whichever half of a two-language field is empty.
export const localizedErrors = (value: LocalizedText, text: Text) => ({
  en: value.en.trim() ? undefined : text.admin.common.enRequired,
  ar: value.ar.trim() ? undefined : text.admin.common.arRequired,
});

export const hasErrors =(errors: Record<string, string | undefined>) => Object.values(errors).some(Boolean);

// The occasion the homepage shows on a day (YYYY-MM-DD), or null for the normal homepage.
// If two overlap, the one that started last wins, so a short occasion inside a long one still shows.
export const occasionOn = (occasions: Occasion[], day: string) =>
  occasions
    .filter((occasion) => isShowingOn(occasion, day))
    .sort((a, b) => b.startDate.localeCompare(a.startDate))[0] ?? null;

export const nextOccasion = (occasions: Occasion[], day: string) =>
  occasions
    .filter((occasion) => occasion.startDate > day)
    .sort((a, b) => a.startDate.localeCompare(b.startDate))[0] ?? null;

// Whether a dated item (an occasion, a banner) is showing on a day.
export const scheduleStatus = (
  { startDate, endDate }: Pick<Banner, 'startDate' | 'endDate'>,
  day: string,
): ScheduleStatus => (day < startDate ? 'scheduled' : day <= endDate ? 'active' : 'ended');

export const programStatus = (program: Program, day: string): ProgramStatus => {
  if (day < program.startDate) return 'upcoming';
  if (day <= program.endDate) return 'open';
  if (program.resultsDate && day <= program.resultsDate) return 'judging';
  return 'closed';
};
