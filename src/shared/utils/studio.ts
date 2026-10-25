import { bilingualTerms, fontCategories, fontSpacings, musicMoods, optimumSizes, studioEarnings, type MusicMood } from '@/shared/constants';
import { previewFonts, type Locale } from '@/shared/theme';
import type { Creator, Item, StudioElement, StudioPayout } from '@/shared/types';
import { seededRandom } from './ai';
import { studioPreview } from './studioPreviews';

const dayMs = 24 * 60 * 60 * 1000;

// ---------- Activity and earnings ----------

export interface StudioDay {
  date: string; // YYYY-MM-DD
  views: number;
  downloads: number;
}

const dayKey = (time: number) => new Date(time).toISOString().slice(0, 10);

// What happened to a live element each day since it went live. The demo has few real customers, so each day gets
// a steady, repeatable amount of views and downloads; real downloads by accounts in this browser are added on top.
export const studioActivity = (element: StudioElement, realDownloads: string[], now: Date = new Date()): StudioDay[] => {
  if (!element.publishedAt) return [];
  const start = new Date(element.publishedAt.slice(0, 10)).getTime();
  const days: StudioDay[] = [];
  for (let time = start; time <= now.getTime(); time += dayMs) {
    const random = seededRandom(`${element.id}:${dayKey(time)}`);
    const views = 5 + Math.floor(random() * 36);
    days.push({ date: dayKey(time), views, downloads: Math.floor(views * (0.05 + random() * 0.1)) });
  }
  // A day published today has no full demo day yet, but its real downloads still count.
  for (const at of realDownloads) {
    const day = days.find((candidate) => candidate.date === at.slice(0, 10));
    if (day) day.downloads += 1;
  }
  return days;
};

export const earningsOf = (downloads: number) => downloads * studioEarnings.perDownload;

// Earnings by month, newest first: "2026-10" -> EGP.
export const earningsByMonth = (days: StudioDay[], months: number = studioEarnings.periodMonths, now: Date = new Date()) =>
  Array.from({ length: months }, (_, back) => {
    const month = new Date(now.getFullYear(), now.getMonth() - back, 1);
    const key = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`;
    const downloads = days.filter((day) => day.date.startsWith(key)).reduce((sum, day) => sum + day.downloads, 0);
    return { month: month.toISOString(), downloads, earnings: earningsOf(downloads) };
  });

export interface StudioBalance {
  total: number; // everything earned
  pending: number; // earned in the last days, held for refunds and claims
  available: number; // can be paid out (earned before that, minus payouts)
  paidOut: number; // paid or asked for (a rejected or failed payout gives the money back)
  canRequest: boolean; // the available balance has reached the minimum
  minimum: number; // the team's minimum payout
}

// Payouts that still take money out of the balance.
const holdsMoney = (payout: StudioPayout) => payout.status !== 'rejected' && payout.status !== 'failed';

export const studioBalance = (days: StudioDay[], payouts: StudioPayout[], minimum: number, now: Date = new Date()): StudioBalance => {
  const cutoff = dayKey(now.getTime() - studioEarnings.pendingDays * dayMs);
  const total = earningsOf(days.reduce((sum, day) => sum + day.downloads, 0));
  const pending = earningsOf(days.filter((day) => day.date > cutoff).reduce((sum, day) => sum + day.downloads, 0));
  const paidOut = payouts.filter(holdsMoney).reduce((sum, payout) => sum + payout.amount, 0);
  const available = Math.max(0, total - pending - paidOut);
  return { total, pending, available, paidOut, canRequest: available >= minimum, minimum };
};

// ---------- Translation ----------

// A first translation for the creator to review: known words are swapped, the rest is kept as written.
export const translateDraft = (value: string, from: Locale, to: Locale) => {
  if (from === to || !value.trim()) return value;
  // The demo has no translation service: words in the shared list are swapped (their usual translation), the rest
  // is kept as written, and the creator reviews and corrects the result.
  const lookup = new Map<string, string>();
  for (const [en, ar] of bilingualTerms) {
    const [source, target] = from === 'en' ? [en, ar] : [ar, en];
    if (!lookup.has(source)) lookup.set(source, target);
  }
  return value
    .split(/(\s+)/)
    .map((word) => {
      const bare = word.toLowerCase().replace(/[.,!?؟،]/g, '');
      return lookup.get(bare) ?? word;
    })
    .join('');
};

// ---------- The element in the customer library ----------

const isMood = (value: string | undefined): value is MusicMood => value !== undefined && (musicMoods as readonly string[]).includes(value);

// A live element as a library item, so customers find, preview and download it like any other.
export const studioItem = (element: StudioElement, creator: Creator, downloads: number): Item => {
  const duration = Number(element.details.duration) || undefined;
  return {
    id: element.id,
    title: element.title,
    description: element.description,
    originalLanguage: element.language,
    categoryId: element.categoryId,
    creator,
    tags: [...new Set([...element.tags.en, ...element.tags.ar])],
    accent: creator.accent,
    image: studioPreview(element, 'image')?.url,
    previewVideo: studioPreview(element, 'video')?.url,
    tier: 'premium',
    formats: [...new Set(element.files.map((file) => (file.name.split('.').pop() ?? '').toUpperCase()).filter(Boolean))],
    fileSize: element.files.reduce((sum, file) => sum + file.size, 0),
    downloads,
    recentDownloads: downloads,
    rating: 0,
    ratingCount: 0,
    createdAt: element.publishedAt ?? element.createdAt,
    featured: false,
    bilingual: element.bilingual,
    local: false,
    occasions: [],
    businesses: [],
    duration,
    music:
      element.categoryId === 'music'
        ? {
            bpm: Number(element.details.bpm) || 100,
            moods: isMood(element.details.mood) ? [element.details.mood] : [],
            genres: [],
            themes: [],
            contentId: element.contentIdRegistered ? 'registered' : 'cleared',
            versions: element.versions.map((version) => ({ kind: version.kind, duration: duration ?? 0 })),
          }
        : undefined,
    font:
      element.categoryId === 'fonts'
        ? { family: previewFonts[0], category: fontCategories[0], optimumSize: optimumSizes[0], spacing: fontSpacings[1], arabic: element.bilingual || element.language === 'ar' }
        : undefined,
  };
};
