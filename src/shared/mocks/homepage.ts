import type { Banner, HomepageOccasion } from '@/shared/types';

// Dates follow the expected Egyptian calendar; Islamic dates can move by a day once the moon is sighted.
export const mockOccasions: HomepageOccasion[] = [
  {
    id: 'occ-1',
    name: { en: 'Back to school', ar: 'العودة للمدارس' },
    headline: { en: 'Everything for the new school year', ar: 'كل ما تحتاجه للعام الدراسي الجديد' },
    startDate: '2026-09-20',
    endDate: '2026-10-31',
  },
  {
    id: 'occ-2',
    name: { en: 'Coptic Christmas', ar: 'عيد الميلاد المجيد' },
    headline: { en: 'Designs for Christmas greetings', ar: 'تصميمات لتهاني عيد الميلاد' },
    startDate: '2026-12-28',
    endDate: '2027-01-08',
  },
  {
    id: 'occ-3',
    name: { en: 'Ramadan', ar: 'رمضان' },
    headline: { en: 'Ramadan Kareem', ar: 'رمضان كريم' },
    startDate: '2027-02-01',
    endDate: '2027-03-09',
  },
  {
    id: 'occ-4',
    name: { en: 'Eid al-Fitr', ar: 'عيد الفطر' },
    headline: { en: 'Eid Mubarak', ar: 'عيد مبارك' },
    startDate: '2027-03-10',
    endDate: '2027-03-13',
  },
  {
    id: 'occ-5',
    name: { en: 'Sham El-Nessim', ar: 'شم النسيم' },
    headline: { en: 'Spring is here', ar: 'أهلًا بالربيع' },
    startDate: '2027-04-28',
    endDate: '2027-05-03',
  },
  {
    id: 'occ-6',
    name: { en: 'Eid al-Adha', ar: 'عيد الأضحى' },
    headline: { en: 'Eid al-Adha Mubarak', ar: 'عيد أضحى مبارك' },
    startDate: '2027-05-12',
    endDate: '2027-05-19',
  },
];

export const mockBanners: Banner[] = [
  {
    id: 'ban-1',
    text: { en: 'Students get 50% off with a university email', ar: 'خصم 50% للطلاب باستخدام البريد الجامعي' },
    link: 'https://tilt.example.com/students',
    startDate: '2026-10-01',
    endDate: '2026-11-30',
  },
];
