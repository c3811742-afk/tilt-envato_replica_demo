import type { Plan, ProjectPass } from '@/shared/types';

// Monthly prices in EGP, VAT included, before the yearly discount.
export const mockPlans: Plan[] = [
  {
    id: 'individual',
    monthlyPrice: 199,
    perMember: false,
    minMembers: 1,
    featured: false,
    downloadsPerMonth: 40,
    credits: 100,
    creditTiers: [],
    concurrentGenerations: 1,
    models: ['tiltImage1'],
    studentPrice: true,
  },
  {
    id: 'ultimate',
    monthlyPrice: 349,
    perMember: false,
    minMembers: 1,
    featured: true,
    downloadsPerMonth: null,
    credits: 500,
    creditTiers: [
      { credits: 500, extraMonthlyPrice: 0 },
      { credits: 1500, extraMonthlyPrice: 150 },
      { credits: 4000, extraMonthlyPrice: 350 },
    ],
    concurrentGenerations: 3,
    models: ['tiltImage1', 'tiltImage2', 'tiltImage2Pro'],
    studentPrice: false,
  },
  {
    id: 'teams',
    monthlyPrice: 149,
    perMember: true,
    minMembers: 3,
    featured: false,
    downloadsPerMonth: 60,
    credits: 200,
    creditTiers: [],
    concurrentGenerations: 2,
    models: ['tiltImage1', 'tiltImage2'],
    studentPrice: false,
  },
  {
    id: 'enterprise',
    monthlyPrice: null,
    perMember: true,
    minMembers: 25,
    featured: false,
    downloadsPerMonth: null,
    credits: 10000,
    creditTiers: [],
    concurrentGenerations: 5,
    models: ['tiltImage1', 'tiltImage2', 'tiltImage2Pro'],
    studentPrice: false,
  },
];

// Short project passes, paid once.
export const mockPasses: ProjectPass[] = [
  { id: 'week', price: 129, days: 7, downloads: 20 },
  { id: 'downloads10', price: 89, days: 30, downloads: 10 },
];

// Promo codes the checkout accepts: a share off the first payment.
export const mockPromoCodes: Record<string, number> = {
  SYNC20: 0.2,
  WELCOME10: 0.1,
};
