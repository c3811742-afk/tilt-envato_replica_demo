import type { ItemReport, Ticket } from '@/features/admin/types';

export const seedTickets: Ticket[] = [
  {
    id: 'tk-301',
    subject: 'Charged twice this month',
    requester: { name: 'Mohamed Saeed', email: 'msaeed@example.com', kind: 'customer' },
    topic: 'billing',
    status: 'open',
    updatedAt: '2026-10-22T11:00:00Z',
    messages: [
      {
        id: 'm-1',
        fromSupport: false,
        authorName: 'Mohamed Saeed',
        body: 'I was charged 149 EGP twice from my wallet on October 20 and 21. Please refund one of them.',
        at: '2026-10-22T11:00:00Z',
      },
    ],
  },
  {
    id: 'tk-302',
    subject: 'متى يتم تحويل أرباحي؟',
    requester: { name: 'أحمد نبيل', email: 'ahmed.nabil@example.com', kind: 'creator' },
    topic: 'payouts',
    status: 'open',
    updatedAt: '2026-10-21T19:30:00Z',
    messages: [
      {
        id: 'm-2',
        fromSupport: false,
        authorName: 'أحمد نبيل',
        body: 'طلبت سحب أرباحي منذ يومين ولم يتغير شيء. متى سيصل التحويل؟',
        at: '2026-10-21T19:30:00Z',
      },
    ],
  },
  {
    id: 'tk-303',
    subject: 'Download link not working',
    requester: { name: 'Rana Hamdy', email: 'rana@example.com', kind: 'customer' },
    topic: 'downloads',
    status: 'answered',
    updatedAt: '2026-10-20T14:10:00Z',
    messages: [
      {
        id: 'm-3',
        fromSupport: false,
        authorName: 'Rana Hamdy',
        body: 'The Wedding Invitation Bundle download stops at 80%.',
        at: '2026-10-20T10:00:00Z',
      },
      {
        id: 'm-4',
        fromSupport: true,
        authorName: 'Salma Mostafa',
        body: 'Sorry about that. We fixed the file. Please try the download again and tell us if it works.',
        at: '2026-10-20T14:10:00Z',
      },
    ],
  },
  {
    id: 'tk-304',
    subject: 'Why was my element rejected?',
    requester: { name: 'Karim Adel', email: 'karim.adel@example.com', kind: 'creator' },
    topic: 'review',
    status: 'closed',
    updatedAt: '2026-10-10T09:00:00Z',
    messages: [
      {
        id: 'm-5',
        fromSupport: false,
        authorName: 'Karim Adel',
        body: 'My logo reveal was rejected but I do not understand the reason.',
        at: '2026-10-09T16:00:00Z',
      },
      {
        id: 'm-6',
        fromSupport: true,
        authorName: 'Salma Mostafa',
        body: 'The preview was too short to review. Please upload a full preview and submit it again.',
        at: '2026-10-10T09:00:00Z',
      },
    ],
  },
];

export const seedItemReports: ItemReport[] = [
  {
    id: 'ir-1',
    element: { id: 'el-203', title: 'Wedding Invitation Bundle' },
    kind: 'brokenFiles',
    reporter: 'Rana Hamdy',
    note: 'The ZIP file is damaged and does not open.',
    reportedAt: '2026-10-20T10:05:00Z',
    status: 'open',
  },
  {
    id: 'ir-2',
    element: { id: 'el-205', title: 'عرض تقديمي لملف شركة' },
    kind: 'infringement',
    reporter: 'Ahmed Fawzy',
    note: 'This copies my presentation template.',
    reportedAt: '2026-10-19T12:00:00Z',
    status: 'open',
  },
  {
    id: 'ir-3',
    element: { id: 'el-206', title: 'Tabla Groove Loop' },
    kind: 'wrongCategory',
    reporter: 'Aya Mahmoud',
    note: 'It is in Ramadan and Eid, but it is a general music loop.',
    reportedAt: '2026-10-15T09:20:00Z',
    status: 'open',
  },
  {
    id: 'ir-4',
    element: { id: 'el-202', title: 'Eid Greeting Stories' },
    kind: 'brokenFiles',
    reporter: 'Omar Zaki',
    note: 'Fonts were missing.',
    reportedAt: '2026-09-25T09:20:00Z',
    status: 'fixed',
  },
];
