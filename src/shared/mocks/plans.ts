import type { Plan } from '@/shared/types';

// Monthly prices in EGP, before the 3- and 12-month discounts.
export const mockPlans: Plan[] = [
  { id: 'student', monthlyPrice: 99, perMember: false, minMembers: 1, featured: false },
  { id: 'individual', monthlyPrice: 199, perMember: false, minMembers: 1, featured: true },
  { id: 'team', monthlyPrice: 149, perMember: true, minMembers: 3, featured: false },
];
