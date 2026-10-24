import type { NoClickSearch, SearchReport } from '@/features/admin/types';

// Search terms from the last 30 days that got no clicks. Customers type in both languages.
export const seedNoClickSearches: NoClickSearch[] = [
  { id: 'ns-1', term: 'شم النسيم', searches: 412, results: 0, lastSearchedAt: '2026-10-22T19:10:00Z' },
  { id: 'ns-2', term: 'koshary logo', searches: 188, results: 3, lastSearchedAt: '2026-10-22T12:00:00Z' },
  { id: 'ns-3', term: 'منيو مطعم', searches: 156, results: 0, lastSearchedAt: '2026-10-21T20:30:00Z' },
  { id: 'ns-4', term: 'coptic christmas card', searches: 97, results: 2, lastSearchedAt: '2026-10-21T08:15:00Z' },
  { id: 'ns-5', term: 'tiktok transitions arabic', searches: 81, results: 6, lastSearchedAt: '2026-10-20T17:40:00Z' },
  { id: 'ns-6', term: 'فيديو خطوبة', searches: 64, results: 1, lastSearchedAt: '2026-10-20T10:05:00Z' },
  { id: 'ns-7', term: 'aswan stock footage', searches: 43, results: 0, lastSearchedAt: '2026-10-18T14:00:00Z' },
  { id: 'ns-8', term: 'mahraganat beat', searches: 39, results: 0, lastSearchedAt: '2026-10-17T22:50:00Z' },
];

export const seedSearchReports: SearchReport[] = [
  {
    id: 'rep-1',
    term: 'wedding invitation',
    element: { id: 'el-206', title: 'Tabla Groove Loop' },
    note: 'This is music, not an invitation.',
    reportedBy: 'Rana Hamdy',
    reportedAt: '2026-10-22T10:20:00Z',
    status: 'open',
  },
  {
    id: 'rep-2',
    term: 'رمضان',
    element: { id: 'el-207', title: 'Back to School Social Pack' },
    note: 'لا علاقة له برمضان.',
    reportedBy: 'محمد سعيد',
    reportedAt: '2026-10-21T21:05:00Z',
    status: 'open',
  },
  {
    id: 'rep-3',
    term: 'pyramids 4k',
    element: { id: 'el-208', title: 'Alexandria Corniche Timelapse' },
    note: 'Alexandria, not Giza.',
    reportedBy: 'Sherif Nabil',
    reportedAt: '2026-10-19T16:45:00Z',
    status: 'open',
  },
  {
    id: 'rep-4',
    term: 'menu',
    element: { id: 'el-201', title: 'Koshary Restaurant Menu' },
    note: 'Wrong result.',
    reportedBy: 'Aya Mahmoud',
    reportedAt: '2026-10-10T09:00:00Z',
    status: 'dismissed',
  },
];
