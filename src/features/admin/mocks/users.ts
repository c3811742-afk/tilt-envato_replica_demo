import type { CreatorApplication, IdentityCheck, UserAccount, UserDownload } from '@/features/admin/types';
import { seedCustomers } from './billing';

const customer = (key: keyof typeof seedCustomers, joinedAt: string, planName?: string): UserAccount => ({
  ...seedCustomers[key],
  kind: 'customer',
  source: 'demo',
  joinedAt,
  status: 'active',
  planName,
});

const creator = (id: string, name: string, email: string, joinedAt: string): UserAccount => ({
  id,
  name,
  email,
  kind: 'creator',
  source: 'demo',
  joinedAt,
  status: 'active',
});

// Customers from the billing demo data (same people, so their payments show on their page) and the creators
// whose elements are in the review queue and the payouts.
export const seedUsers: UserAccount[] = [
  customer('rana', '2025-03-14T10:00:00Z', 'Starter'),
  customer('mohamed', '2025-06-02T18:20:00Z', 'Pro'),
  customer('sherif', '2024-11-09T08:45:00Z', 'Pro'),
  customer('aya', '2026-01-21T13:05:00Z', 'Student'),
  customer('studio', '2024-07-30T09:12:00Z', 'Team'),
  customer('hoda', '2025-09-17T16:40:00Z', 'Starter'),
  {
    ...customer('omar', '2025-02-05T11:30:00Z'),
    status: 'suspended',
    statusReason: 'licenseMisuse',
    statusAt: '2026-10-12T09:00:00Z',
    appeal: {
      message: 'I bought a Team plan for my agency and shared the files with my two designers. I did not know each of them needs a seat. I have now added the seats.',
      at: '2026-10-14T15:22:00Z',
    },
  },
  {
    id: 'cu-8',
    name: 'Unknown Buyer',
    email: 'quickdeals@example.com',
    kind: 'customer',
    source: 'demo',
    joinedAt: '2026-08-28T02:10:00Z',
    status: 'banned',
    statusReason: 'paymentFraud',
    statusAt: '2026-09-03T10:15:00Z',
  },
  {
    ...customer('aya', '2026-01-21T13:05:00Z'),
    id: 'cu-9',
    name: 'Mai Adel',
    email: 'mai.adel@example.com',
    status: 'suspended',
    statusReason: 'termsBreach',
    statusAt: '2026-10-19T12:40:00Z',
    appeal: {
      message: 'My account was suspended after I uploaded a logo to AI Studio. It is my own company logo, and I can send proof that we own it.',
      at: '2026-10-20T08:05:00Z',
    },
  },
  creator('cr-1', 'Hana Saleh', 'hana.saleh@example.com', '2023-05-11T10:00:00Z'),
  creator('cr-2', 'أحمد نبيل', 'ahmed.nabil@example.com', '2023-08-19T10:00:00Z'),
  creator('cr-3', 'Mostafa Ali', 'mostafa.ali@example.com', '2024-01-07T10:00:00Z'),
  creator('cr-4', 'Laila Mansour', 'laila.mansour@example.com', '2022-12-02T10:00:00Z'),
  creator('cr-5', 'Youssef Magdy', 'youssef.magdy@example.com', '2024-04-25T10:00:00Z'),
  creator('cr-6', 'Dina Farouk', 'dina.farouk@example.com', '2024-09-13T10:00:00Z'),
  creator('cr-7', 'Tarek Samir', 'tarek.samir@example.com', '2025-02-28T10:00:00Z'),
  creator('cr-8', 'Ramy Khaled', 'ramy.khaled@example.com', '2023-10-30T10:00:00Z'),
  creator('cr-9', 'سارة إبراهيم', 'sara.ibrahim@example.com', '2025-06-14T10:00:00Z'),
  creator('cr-10', 'Mona Gamal', 'mona.gamal@example.com', '2025-11-03T10:00:00Z'),
  creator('cr-11', 'نادين حسام', 'nadine.hossam@example.com', '2026-03-22T10:00:00Z'),
  creator('cr-12', 'Hossam Wael', 'hossam.wael@example.com', '2026-07-09T10:00:00Z'),
];

const titles = [
  'Ramadan Kareem Social Media Pack',
  'Cairo Street Ambience',
  'Oud Morning Theme',
  'Pyramids at Sunset 4K',
  'Koshary Restaurant Menu',
  'Eid Greeting Stories',
  'Wedding Invitation Bundle',
  'Nile Drone Footage',
  'Tabla Groove Loop',
  'Alexandria Corniche Timelapse',
  'Flash Sale Banner Set',
  'Classic Office Presentation',
];

const hourMs = 60 * 60 * 1000;

// `count` downloads spread evenly over the last `hours` hours, newest first.
const downloadsOver = (userId: string, count: number, hours: number, offsetHours = 0): UserDownload[] =>
  Array.from({ length: count }, (_, index) => ({
    id: `${userId}-dl-${offsetHours}-${index}`,
    itemTitle: titles[index % titles.length],
    licenseCode: `TILT-${userId.toUpperCase().replace('-', '')}-${String(offsetHours * 100 + index).padStart(4, '0')}`,
    at: new Date(Date.now() - (offsetHours + (index * hours) / count) * hourMs).toISOString(),
  }));

// Downloads per account. Sherif normally downloads a few a day, then 64 in the last day: the unusual-downloads alert.
// Nile Studio downloads a lot every day, which is normal for a team, so it isn't flagged.
export const seedUserDownloads: Record<string, UserDownload[]> = {
  'cu-1': downloadsOver('cu-1', 9, 24 * 20),
  'cu-2': downloadsOver('cu-2', 22, 24 * 25),
  'cu-3': [...downloadsOver('cu-3', 64, 20), ...downloadsOver('cu-3', 90, 24 * 29, 24)],
  'cu-4': downloadsOver('cu-4', 6, 24 * 12),
  'cu-5': [...downloadsOver('cu-5', 45, 22), ...downloadsOver('cu-5', 1200, 24 * 29, 24)],
  'cu-6': downloadsOver('cu-6', 14, 24 * 28),
  'cu-7': downloadsOver('cu-7', 31, 24 * 9, 24 * 12),
  'cu-8': downloadsOver('cu-8', 48, 30, 24 * 50),
  'cu-9': downloadsOver('cu-9', 5, 24 * 15, 24 * 5),
};

export const seedCreatorApplications: CreatorApplication[] = [
  {
    id: 'APP-310482',
    program: 'author',
    name: 'Karim Fouad',
    email: 'karim.fouad@example.com',
    portfolio: 'https://behance.net/karimfouad',
    categories: ['videoTemplates', 'graphicTemplates'],
    at: '2026-10-21T09:30:00Z',
    source: 'demo',
    status: 'pending',
  },
  {
    id: 'APP-310517',
    program: 'author',
    name: 'ريم عبد الله',
    email: 'reem.abdallah@example.com',
    portfolio: 'https://dribbble.com/reemdesigns',
    categories: ['graphics', 'fonts'],
    at: '2026-10-22T14:05:00Z',
    source: 'demo',
    status: 'pending',
  },
  {
    id: 'APP-310590',
    program: 'author',
    name: 'Ziad Hany',
    email: 'ziad.hany@example.com',
    portfolio: 'https://soundcloud.com/ziadhany',
    categories: ['music', 'soundEffects'],
    at: '2026-10-23T19:48:00Z',
    source: 'demo',
    status: 'pending',
  },
  {
    id: 'APP-309871',
    program: 'author',
    name: 'Fast Templates Co',
    email: 'sales@fasttemplates.example.com',
    portfolio: 'https://fasttemplates.example.com',
    categories: ['presentationTemplates'],
    at: '2026-10-08T07:12:00Z',
    source: 'demo',
    status: 'rejected',
    decision: {
      reason: 'notOriginal',
      note: 'The samples match templates sold on other sites.',
      adminName: 'Mariam Adel',
      at: '2026-10-09T10:00:00Z',
    },
  },
];

export const seedIdentityChecks: IdentityCheck[] = [
  {
    id: 'idc-1',
    creator: { id: 'cr-11', name: 'نادين حسام', email: 'nadine.hossam@example.com' },
    document: 'nationalId',
    nameOnDocument: 'نادين حسام محمود',
    numberEnding: '4417',
    expiresAt: '2031-05-01',
    submittedAt: '2026-10-20T11:15:00Z',
    status: 'pending',
  },
  {
    id: 'idc-2',
    creator: { id: 'cr-12', name: 'Hossam Wael', email: 'hossam.wael@example.com' },
    document: 'passport',
    nameOnDocument: 'Hossam Wael Ibrahim',
    numberEnding: '0932',
    expiresAt: '2026-11-30',
    submittedAt: '2026-10-22T16:40:00Z',
    status: 'pending',
  },
  {
    id: 'idc-3',
    creator: { id: 'cr-10', name: 'Mona Gamal', email: 'mona.gamal@example.com' },
    document: 'nationalId',
    nameOnDocument: 'Mona Gamal Abdelrahman',
    numberEnding: '7720',
    expiresAt: '2030-02-14',
    submittedAt: '2026-10-23T08:20:00Z',
    status: 'pending',
  },
  {
    id: 'idc-4',
    creator: { id: 'cr-7', name: 'Tarek Samir', email: 'tarek.samir@example.com' },
    document: 'nationalId',
    nameOnDocument: 'Tarek Samir Fawzy',
    numberEnding: '1186',
    expiresAt: '2029-08-09',
    submittedAt: '2026-09-30T13:00:00Z',
    status: 'approved',
    decision: { note: '', adminName: 'Youssef Ekram', at: '2026-10-01T09:30:00Z' },
  },
];
