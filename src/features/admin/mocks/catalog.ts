import type { Category, CategoryAttribute } from '@/features/admin/types';
import type { CategoryId } from '@/shared/types';

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

// The site's categories, each with the attributes the review form asks for (admin only), followed by
// subcategories (admin only). The site's names, order and hidden state are applied when they're read (see catalogApi).
const topLevel = (id: CategoryId, attributes: CategoryAttribute[] = []): Category => ({
  id,
  name: { en: '', ar: '' },
  parentId: null,
  hidden: false,
  attributes,
});

const subcategory = (id: string, parentId: CategoryId, name: Category['name'], hidden = false): Category => ({
  id,
  name,
  parentId,
  hidden,
  attributes: [],
});

export const seedCategories: Category[] = [
  topLevel('videoTemplates', [orientation, bilingual]),
  subcategory('sub-video-intros', 'videoTemplates', { en: 'Intros and openers', ar: 'مقدمات وافتتاحيات' }),
  subcategory('sub-video-social', 'videoTemplates', { en: 'Social media videos', ar: 'فيديوهات السوشيال ميديا' }),
  topLevel('stockVideo', [
    orientation,
    attribute({ id: 'attr-duration', name: { en: 'Duration (seconds)', ar: 'المدة (بالثواني)' }, type: 'range' }),
  ]),
  subcategory('sub-video-landmarks', 'stockVideo', { en: 'Egyptian landmarks', ar: 'معالم مصرية' }),
  topLevel('music'),
  topLevel('soundEffects'),
  topLevel('fonts', [bilingual]),
  subcategory('sub-fonts-calligraphy', 'fonts', { en: 'Arabic calligraphy', ar: 'الخط العربي' }),
  topLevel('graphics', [
    orientation,
    attribute({ id: 'attr-print-size', name: { en: 'Print size', ar: 'مقاس الطباعة' }, type: 'multiple', options: ['A4', 'A5', '5x7 in'] }),
  ]),
  subcategory('sub-graphics-weddings', 'graphics', { en: 'Weddings and engagements', ar: 'الأفراح والخطوبة' }),
  subcategory('sub-graphics-flyers', 'graphics', { en: 'Printed flyers', ar: 'الفلايرات المطبوعة' }, true),
  topLevel('graphicTemplates', [
    bilingual,
    attribute({ id: 'attr-currency', name: { en: 'Prices in', ar: 'الأسعار بعملة' }, type: 'single', options: ['EGP', 'SAR', 'AED', 'USD'] }),
  ]),
  subcategory('sub-templates-menus', 'graphicTemplates', { en: 'Restaurant menus', ar: 'قوائم المطاعم' }),
  topLevel('photos', [orientation]),
  topLevel('presentationTemplates', [
    attribute({ id: 'attr-slides', name: { en: 'Number of slides', ar: 'عدد الشرائح' }, type: 'range' }),
  ]),
  topLevel('webTemplates'),
];

// Tags no element uses yet, on top of the tags taken from the elements. One is banned already.
export const seedExtraTags = [
  { name: 'free download', banned: true },
  { name: 'eid mubarak', banned: false },
  { name: 'Ramadan', banned: false },
];
