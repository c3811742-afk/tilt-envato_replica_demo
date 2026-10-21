import type { Admin } from '@/features/admin/types';

// One admin per role, so the "Signed in as" switch can show what each role sees.
export const seedAdmins: Admin[] = [
  { id: 'admin-1', name: 'Youssef Ekram', email: 'youssef@example.com', role: 'superAdmin', createdAt: '2026-06-01T09:00:00Z' },
  { id: 'admin-2', name: 'Mariam Adel', email: 'mariam@example.com', role: 'reviewer', createdAt: '2026-06-15T09:00:00Z' },
  { id: 'admin-3', name: 'Omar Hassan', email: 'omar@example.com', role: 'reviewer', createdAt: '2026-07-02T09:00:00Z' },
  { id: 'admin-4', name: 'Nour El-Sayed', email: 'nour@example.com', role: 'content', createdAt: '2026-07-20T09:00:00Z' },
  { id: 'admin-5', name: 'Karim Fathy', email: 'karim@example.com', role: 'finance', createdAt: '2026-08-05T09:00:00Z' },
  { id: 'admin-6', name: 'Salma Mostafa', email: 'salma@example.com', role: 'support', createdAt: '2026-09-10T09:00:00Z' },
];
