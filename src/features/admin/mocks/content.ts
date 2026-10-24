import type { Article, Faq, LegalPage } from '@/features/admin/types';

export const seedFaqs: Faq[] = [
  {
    id: 'faq-1',
    question: { en: 'Can I use downloads in client work?', ar: 'هل يمكنني استخدام التنزيلات في أعمال العملاء؟' },
    answer: {
      en: 'Yes. Every download comes with a license for one project, including client projects.',
      ar: 'نعم. كل تنزيل يأتي بترخيص لمشروع واحد، بما في ذلك مشاريع العملاء.',
    },
  },
  {
    id: 'faq-2',
    question: { en: 'Can I pay in Egyptian pounds?', ar: 'هل يمكنني الدفع بالجنيه المصري؟' },
    answer: {
      en: 'Yes. You can pay with a local card, Fawry or a mobile wallet.',
      ar: 'نعم. يمكنك الدفع ببطاقة محلية أو فوري أو محفظة إلكترونية.',
    },
  },
  {
    id: 'faq-3',
    question: { en: 'What happens to my licenses if I cancel?', ar: 'ماذا يحدث لتراخيصي إذا ألغيت الاشتراك؟' },
    answer: {
      en: 'Projects you already licensed stay covered. You can no longer download new items.',
      ar: 'تظل المشاريع التي رخّصتها مشمولة بالترخيص، لكن لن تتمكن من تنزيل عناصر جديدة.',
    },
  },
  {
    id: 'faq-4',
    question: { en: 'How do I become a creator?', ar: 'كيف أصبح صانع محتوى على TILT؟' },
    answer: {
      en: 'Sign up, choose "Sell on TILT" and submit your first element for review.',
      ar: 'أنشئ حسابًا، واختر "البيع على TILT"، ثم أرسل أول عنصر للمراجعة.',
    },
  },
];

export const seedLegalPages: LegalPage[] = [
  {
    id: 'terms',
    body: {
      en: 'These terms explain how you can use TILT and what we expect from every customer and creator.',
      ar: 'توضح هذه الشروط كيفية استخدام TILT وما نتوقعه من كل عميل وصانع محتوى.',
    },
    updatedAt: '2026-06-01T09:00:00Z',
    updatedBy: 'Youssef Ekram',
  },
  {
    id: 'privacy',
    body: {
      en: 'This policy explains what data we collect, why we collect it and how you can control it.',
      ar: 'توضح هذه السياسة البيانات التي نجمعها وسبب جمعها وكيف يمكنك التحكم فيها.',
    },
    updatedAt: '2026-06-01T09:00:00Z',
    updatedBy: 'Youssef Ekram',
  },
  {
    id: 'license',
    body: {
      en: 'Each download is licensed for one project. You can use it in commercial and client work.',
      ar: 'كل تنزيل مرخّص لمشروع واحد، ويمكنك استخدامه في الأعمال التجارية وأعمال العملاء.',
    },
    updatedAt: '2026-08-15T09:00:00Z',
    updatedBy: 'Nour El-Sayed',
  },
];

const article = (seed: Omit<Article, 'status' | 'updatedAt'> & Partial<Article>): Article => ({
  status: 'published',
  updatedAt: seed.publishedAt ?? '2026-09-01T09:00:00Z',
  ...seed,
});

export const seedArticles: Article[] = [
  article({
    id: 'art-1',
    kind: 'help',
    title: { en: 'How to download an element', ar: 'كيفية تنزيل عنصر' },
    body: {
      en: 'Open the element and choose Download. Pick the project the license is for.',
      ar: 'افتح العنصر واختر تنزيل، ثم اختر المشروع الذي تريد الترخيص له.',
    },
    publishedAt: '2026-07-01T09:00:00Z',
  }),
  article({
    id: 'art-2',
    kind: 'help',
    title: { en: 'Change your payment method', ar: 'تغيير طريقة الدفع' },
    body: {
      en: 'Go to Account, then Billing, and choose a new card or wallet.',
      ar: 'اذهب إلى الحساب ثم الفواتير، واختر بطاقة أو محفظة جديدة.',
    },
    publishedAt: '2026-07-10T09:00:00Z',
  }),
  article({
    id: 'art-3',
    kind: 'help',
    title: { en: 'Refunds for students', ar: 'استرداد المبالغ للطلاب' },
    body: { en: 'Draft. Waiting for the finance team.', ar: '' },
    status: 'draft',
    updatedAt: '2026-10-20T09:00:00Z',
  }),
  article({
    id: 'art-4',
    kind: 'learn',
    title: { en: 'Design a Ramadan post in Canva', ar: 'صمّم منشور رمضان على كانفا' },
    body: {
      en: 'A step-by-step guide to editing a TILT Ramadan template in Canva.',
      ar: 'دليل خطوة بخطوة لتعديل قالب رمضان من TILT على كانفا.',
    },
    publishedAt: '2026-08-20T09:00:00Z',
  }),
  article({
    id: 'art-5',
    kind: 'learn',
    title: { en: 'Choosing Arabic fonts', ar: 'اختيار الخطوط العربية' },
    body: {
      en: 'How to pair Arabic and Latin fonts so both read well.',
      ar: 'كيف تختار خطًا عربيًا وخطًا لاتينيًا يناسبان بعضهما.',
    },
    publishedAt: '2026-09-05T09:00:00Z',
  }),
  article({
    id: 'art-6',
    kind: 'releaseNote',
    title: { en: 'Pay with Fawry', ar: 'الدفع عبر فوري' },
    body: {
      en: 'You can now pay for your plan at any Fawry outlet.',
      ar: 'يمكنك الآن دفع اشتراكك من أي منفذ فوري.',
    },
    publishedAt: '2026-09-15T09:00:00Z',
  }),
  article({
    id: 'art-7',
    kind: 'releaseNote',
    title: { en: 'Search in Arabic', ar: 'البحث باللغة العربية' },
    body: {
      en: 'Search now understands Arabic words with or without diacritics.',
      ar: 'أصبح البحث يفهم الكلمات العربية بالتشكيل أو بدونه.',
    },
    publishedAt: '2026-10-05T09:00:00Z',
  }),
];
