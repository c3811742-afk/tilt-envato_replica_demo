import type { Announcement, Audience, Newsletter } from '@/features/admin/types';

// How many people each audience reaches in the demo.
export const audienceSizes: Record<Audience, number> = {
  customers: 1240,
  creators: 186,
  everyone: 1426,
};

export const newsletterSubscribers = 3410;

export const seedAnnouncements: Announcement[] = [
  {
    id: 'ann-1',
    audience: 'creators',
    title: 'New review guidelines',
    body: 'From November, every element needs a preview in both Arabic and English.',
    status: 'scheduled',
    sendAt: '2026-11-01T08:00:00Z',
    recipients: 186,
    sentBy: 'Nour El-Sayed',
  },
  {
    id: 'ann-2',
    audience: 'everyone',
    title: 'صيانة مجدولة',
    body: 'سيتوقف الموقع لمدة ساعة يوم الجمعة من 2 إلى 3 صباحًا.',
    status: 'sent',
    sendAt: '2026-10-10T09:00:00Z',
    recipients: 1426,
    sentBy: 'Youssef Ekram',
  },
  {
    id: 'ann-3',
    audience: 'customers',
    title: 'Fawry payments are here',
    body: 'You can now pay for your plan at any Fawry outlet.',
    status: 'sent',
    sendAt: '2026-09-15T09:00:00Z',
    recipients: 1180,
    sentBy: 'Nour El-Sayed',
  },
];

export const seedNewsletters: Newsletter[] = [
  {
    id: 'nl-1',
    subject: 'October picks: back to school',
    body: 'Our favorite new elements for schools, teachers and learning centers.',
    sentAt: '2026-10-01T08:00:00Z',
    recipients: 3355,
    sentBy: 'Nour El-Sayed',
  },
  {
    id: 'nl-2',
    subject: 'مختارات سبتمبر',
    body: 'أحدث القوالب والخطوط العربية لهذا الشهر.',
    sentAt: '2026-09-01T08:00:00Z',
    recipients: 3290,
    sentBy: 'Nour El-Sayed',
  },
];
