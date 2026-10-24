import type { Plan, ProjectPass, PromoCode } from '@/shared/types';

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
    videoModels: ['tiltMotion1'],
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
    videoModels: ['tiltMotion1', 'tiltMotion2'],
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
    videoModels: ['tiltMotion1'],
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
    videoModels: ['tiltMotion1', 'tiltMotion2'],
    studentPrice: false,
  },
];

// Short project passes, paid once.
export const mockPasses: ProjectPass[] = [
  { id: 'week', price: 129, days: 7, downloads: 20 },
  { id: 'downloads10', price: 89, days: 30, downloads: 10 },
];

// Promo codes the checkout accepts (until the admin team changes them): a share off the first payment.
export const mockPromoCodes: PromoCode[] = [
  { id: 'promo-sync20', code: 'SYNC20', percent: 20, planIds: [], expiresAt: '2027-12-31', maxUses: null, uses: 0, active: true },
  { id: 'promo-welcome10', code: 'WELCOME10', percent: 10, planIds: [], expiresAt: '2027-12-31', maxUses: null, uses: 0, active: true },
  { id: 'promo-ramadan30', code: 'RAMADAN30', percent: 30, planIds: [], expiresAt: '2027-03-09', maxUses: 500, uses: 0, active: true },
  { id: 'promo-helwan50', code: 'HELWAN50', percent: 50, planIds: ['individual'], expiresAt: '2027-01-31', maxUses: 100, uses: 42, active: true },
  { id: 'promo-eid2026', code: 'EID2026', percent: 20, planIds: [], expiresAt: '2026-06-10', maxUses: null, uses: 311, active: true },
];
