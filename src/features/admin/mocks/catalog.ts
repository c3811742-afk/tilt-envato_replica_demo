import type { Category, CategoryAttribute } from '@/features/admin/types';

const attribute = (seed: Omit<CategoryAttribute, 'options' | 'isFilter'> & Partial<CategoryAttribute>) => ({
  options: [],
  isFilter: true,
  ...seed,
});

const orientation = attribute({
  id: 'attr-orientation',
  name: { en: 'Orientation', ar: 'الاتجاه' },
  type: 'single',
  options: ['Portrait', 'Landscape', 'Square'],
});

const bilingual = attribute({
  id: 'attr-bilingual',
  name: { en: 'Arabic and English text', ar: 'نص عربي وإنجليزي' },
  type: 'boolean',
});

// Top-level category ids match the element categories, so live elements stay linked to them.
export const seedCategories: Category[] = [
  {
    id: 'ramadan',
    name: { en: 'Ramadan and Eid', ar: 'رمضان والعيد' },
    parentId: null,
    hidden: false,
    attributes: [orientation, bilingual],
  },
  {
    id: 'sub-ramadan-social',
    name: { en: 'Social media posts', ar: 'منشورات السوشيال ميديا' },
    parentId: 'ramadan',
    hidden: false,
    attributes: [],
  },
  {
    id: 'sub-ramadan-greetings',
    name: { en: 'Greeting cards', ar: 'بطاقات التهنئة' },
    parentId: 'ramadan',
    hidden: false,
    attributes: [],
  },
  {
    id: 'weddings',
    name: { en: 'Weddings and engagements', ar: 'الأفراح والخطوبة' },
    parentId: null,
    hidden: false,
    attributes: [
      orientation,
      attribute({
        id: 'attr-print-size',
        name: { en: 'Print size', ar: 'مقاس الطباعة' },
        type: 'multiple',
        options: ['A4', 'A5', '5x7 in'],
      }),
    ],
  },
  {
    id: 'sub-weddings-katb-ketab',
    name: { en: 'Katb el-ketab', ar: 'كتب الكتاب' },
    parentId: 'weddings',
    hidden: false,
    attributes: [],
  },
  {
    id: 'restaurants',
    name: { en: 'Restaurants and cafés', ar: 'المطاعم والكافيهات' },
    parentId: null,
    hidden: false,
    attributes: [
      attribute({
        id: 'attr-currency',
        name: { en: 'Prices in', ar: 'الأسعار بعملة' },
        type: 'single',
        options: ['EGP', 'SAR', 'AED', 'USD'],
      }),
    ],
  },
  {
    id: 'realEstate',
    name: { en: 'Real estate', ar: 'العقارات' },
    parentId: null,
    hidden: false,
    attributes: [],
  },
  {
    id: 'education',
    name: { en: 'Education', ar: 'التعليم' },
    parentId: null,
    hidden: false,
    attributes: [],
  },
  {
    id: 'business',
    name: { en: 'Business', ar: 'الأعمال' },
    parentId: null,
    hidden: false,
    attributes: [
      attribute({
        id: 'attr-slides',
        name: { en: 'Number of slides', ar: 'عدد الشرائح' },
        type: 'range',
      }),
    ],
  },
  {
    id: 'landmarks',
    name: { en: 'Egyptian landmarks', ar: 'معالم مصرية' },
    parentId: null,
    hidden: false,
    attributes: [
      attribute({
        id: 'attr-duration',
        name: { en: 'Duration (seconds)', ar: 'المدة (بالثواني)' },
        type: 'range',
      }),
    ],
  },
  {
    id: 'sub-landmarks-giza',
    name: { en: 'Giza and the pyramids', ar: 'الجيزة والأهرامات' },
    parentId: 'landmarks',
    hidden: false,
    attributes: [],
  },
  {
    id: 'calligraphy',
    name: { en: 'Arabic calligraphy', ar: 'الخط العربي' },
    parentId: null,
    hidden: false,
    attributes: [],
  },
  {
    id: 'sub-old-flyers',
    name: { en: 'Printed flyers', ar: 'الفلايرات المطبوعة' },
    parentId: 'business',
    hidden: true,
    attributes: [],
  },
];

// Tags no element uses yet, on top of the tags taken from the elements. One is banned already.
export const seedExtraTags = [
  { name: 'free download', banned: true },
  { name: 'eid mubarak', banned: false },
  { name: 'Ramadan', banned: false },
];
