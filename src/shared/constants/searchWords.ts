// Words that search understands beyond the catalog text.

// Everyday words (Egyptian Arabic, Franco-Arab, short forms) and the catalog words they mean.
// Keys and values are matched after normalizing (lower case, Arabic letter forms unified).
export const searchSynonyms: Record<string, readonly string[]> = {
  farah: ['wedding', 'زفاف'],
  فرح: ['wedding', 'زفاف'],
  afrah: ['wedding', 'زفاف'],
  أفراح: ['wedding', 'زفاف'],
  khotoba: ['engagement', 'خطوبة'],
  '3eed': ['eid', 'عيد'],
  eed: ['eid', 'عيد'],
  ramadn: ['ramadan', 'رمضان'],
  mazika: ['music', 'موسيقى'],
  مزيكا: ['music', 'موسيقى'],
  aghany: ['music', 'موسيقى'],
  agani: ['music', 'موسيقى'],
  أغاني: ['music', 'موسيقى'],
  song: ['music'],
  songs: ['music'],
  sora: ['photo', 'صور'],
  sowar: ['photo', 'صور'],
  صوره: ['photo', 'صور'],
  lwgo: ['logo', 'شعار'],
  logo: ['شعار', 'لوجو'],
  لوجو: ['logo', 'شعار'],
  '5at': ['font', 'خط'],
  khat: ['font', 'خط'],
  khotot: ['font', 'خطوط'],
  mahragan: ['mahraganat', 'مهرجانات'],
  مهرجان: ['mahraganat', 'مهرجانات'],
  sha3by: ['shaabi', 'شعبي'],
  shaaby: ['shaabi', 'شعبي'],
  hady: ['calm', 'هادي'],
  هادئ: ['calm', 'هادي'],
  relaxing: ['calm', 'chill'],
  gamed: ['energetic', 'party'],
  جامد: ['energetic', 'party'],
  حماسي: ['energetic', 'epic'],
  za7ma: ['crowd', 'traffic', 'زحمة'],
  akl: ['food', 'أكل'],
  ahwa: ['coffee', 'قهوة'],
  koshary: ['koshari', 'كشري'],
  mo2adema: ['intro', 'مقدمة'],
  تصميم: ['design', 'template'],
  eskendereya: ['alexandria', 'الإسكندرية'],
  اسكندرية: ['alexandria', 'الإسكندرية'],
  masr: ['egypt', 'مصر'],
  qahera: ['cairo', 'القاهرة'],
  saydalya: ['pharmacy', 'صيدلية'],
  mat3am: ['restaurant', 'مطعم'],
  ma7al: ['store', 'shop', 'متجر'],
  محل: ['store', 'shop', 'متجر'],
  ta5arog: ['graduation', 'تخرج'],
  takharog: ['graduation', 'تخرج'],
  insta: ['instagram', 'انستجرام'],
  انستا: ['instagram', 'انستجرام'],
  tiktok: ['tiktok', 'تيك توك'],
  reel: ['reels', 'ريلز'],
  bosta: ['post', 'بوست'],
  mashro3: ['project', 'مشروع'],
  بريزنتيشن: ['presentation', 'عرض'],
  slides: ['presentation', 'عرض'],
  ويبسايت: ['website', 'موقع'],
  sfx: ['sound', 'effect'],
  عيال: ['kids', 'أطفال'],
  atfal: ['kids', 'أطفال'],
  doctor: ['clinic', 'عيادة'],
  دكتور: ['clinic', 'عيادة'],
  helw: ['beautiful', 'elegant'],
  حلو: ['elegant', 'أنيق'],
  clip: ['video', 'footage'],
  footage: ['video', 'stock'],
  // Other names of file types.
  jpeg: ['jpg'],
  ppt: ['pptx'],
  woff: ['woff2'],
  ae: ['aep'],
  prproj: ['premiere'],
  pr: ['prproj'],
};

// Words that carry no meaning in a search ("music for my video" searches "music" and "video").
export const searchStopWords: readonly string[] = [
  'a', 'an', 'the', 'for', 'of', 'and', 'or', 'with', 'to', 'in', 'on', 'at', 'by', 'my', 'me', 'i', 'we', 'our',
  'need', 'want', 'some', 'something', 'looking', 'like', 'that', 'this', 'is', 'are', 'be', 'about', 'any', 'can', 'please',
  'في', 'من', 'على', 'الى', 'إلى', 'عن', 'مع', 'و', 'او', 'أو', 'عايز', 'عاوز', 'عايزة', 'محتاج', 'محتاجة', 'اريد', 'أريد',
  'حاجه', 'حاجة', 'شيء', 'ده', 'دي', 'هذا', 'هذه', 'بس', 'لو', 'سمحت', 'ل', 'لي', 'ليا', 'بتاع', 'بتاعة', 'بتاعي',
];

// Arabic prefixes that are written joined to the word ("للفيديو" is "فيديو"): also tried without them.
export const arabicPrefixes: readonly string[] = ['وال', 'بال', 'فال', 'كال', 'لل', 'ال', 'و', 'ب', 'ل'];

// The shortest word left after removing a prefix (so "ولد" isn't read as "لد").
export const arabicStemMinLength = 3;

// Descriptive searches ("calm oud music for a Ramadan video") match items that have most of the words:
// with more than `strictWordCount` words, an item needs this share of them.
// When that finds fewer than `minResults` items, the closest ones are shown too (any of the words, most matches first),
// so "a logo for my coffee shop" shows the logos and the coffee items instead of nothing.
export const naturalSearch = {
  strictWordCount: 2,
  minMatchShare: 0.6,
  minResults: 6,
} as const;

// How much a match in each part of an item counts. A title says what the item is, so it counts most: "Wedding
// Slideshow" ranks above a font tagged "wedding" for invitations.
export const searchWeights = {
  title: 4,
  tag: 3,
  tagWord: 2,
  meta: 1.5,
  creator: 1,
  description: 0.5,
} as const;
