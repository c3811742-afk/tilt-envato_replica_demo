import { fontCategories, fontSpacings, musicMoods, optimumSizes, studioEarnings, type MusicMood } from '@/shared/constants';
import { previewFonts, type Locale } from '@/shared/theme';
import type { Creator, Item, StudioElement, StudioPayout } from '@/shared/types';
import { seededRandom } from './ai';

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

// Words that come up in element titles and tags, both ways. The demo has no translation service: anything not in
// this list is kept as written, and the creator reviews and corrects the result.
const glossary: [string, string][] = [
  ['ramadan', 'رمضان'],
  ['eid', 'عيد'],
  ['wedding', 'زفاف'],
  ['invitation', 'دعوة'],
  ['graduation', 'تخرج'],
  ['birthday', 'عيد ميلاد'],
  ['logo', 'شعار'],
  ['intro', 'مقدمة'],
  ['opener', 'افتتاحية'],
  ['template', 'قالب'],
  ['video', 'فيديو'],
  ['music', 'موسيقى'],
  ['sound', 'صوت'],
  ['font', 'خط'],
  ['arabic', 'عربي'],
  ['english', 'إنجليزي'],
  ['poster', 'ملصق'],
  ['flyer', 'منشور'],
  ['menu', 'قائمة طعام'],
  ['restaurant', 'مطعم'],
  ['story', 'ستوري'],
  ['instagram', 'إنستجرام'],
  ['social', 'سوشيال'],
  ['media', 'ميديا'],
  ['presentation', 'عرض تقديمي'],
  ['business', 'أعمال'],
  ['modern', 'عصري'],
  ['minimal', 'بسيط'],
  ['elegant', 'أنيق'],
  ['gold', 'ذهبي'],
  ['blue', 'أزرق'],
  ['calm', 'هادئ'],
  ['happy', 'سعيد'],
  ['energetic', 'حماسي'],
  ['cinematic', 'سينمائي'],
  ['oud', 'عود'],
  ['piano', 'بيانو'],
  ['guitar', 'جيتار'],
  ['drums', 'طبول'],
  ['loop', 'لوب'],
  ['beat', 'إيقاع'],
  ['morning', 'صباح'],
  ['school', 'مدرسة'],
  ['kids', 'أطفال'],
  ['education', 'تعليم'],
  ['travel', 'سفر'],
  ['nature', 'طبيعة'],
  ['summer', 'صيف'],
  ['winter', 'شتاء'],
  ['slideshow', 'عرض شرائح'],
  ['transition', 'انتقال'],
  ['title', 'عنوان'],
  ['icon', 'أيقونة'],
  ['pattern', 'نقش'],
  ['night', 'ليل'],
  ['city', 'مدينة'],
  ['cairo', 'القاهرة'],
  ['nile', 'النيل'],
  ['desert', 'صحراء'],
  ['photo', 'صورة'],
  ['pack', 'مجموعة'],
  ['kit', 'حزمة'],
  ['background', 'خلفية'],
  ['frame', 'إطار'],
  ['greeting', 'تهنئة'],
  ['card', 'بطاقة'],
  ['sale', 'تخفيضات'],
  ['and', 'و'],
  ['for', 'لـ'],
  ['with', 'مع'],
];

// A first translation for the creator to review: known words are swapped, the rest is kept as written.
export const translateDraft = (value: string, from: Locale, to: Locale) => {
  if (from === to || !value.trim()) return value;
  const lookup = new Map(glossary.map(([en, ar]) => (from === 'en' ? [en, ar] : [ar, en])));
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
