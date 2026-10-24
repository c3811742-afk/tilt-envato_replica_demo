import type { Program } from '@/shared/types';

// Programs and competitions the team runs with universities.
export const mockPrograms: Program[] = [
  {
    id: 'prog-1',
    kind: 'studentProgram',
    name: 'TILT Student Creators',
    university: 'Helwan University, Faculty of Applied Arts',
    description: 'Students publish their first elements with a mentor from the review team.',
    startDate: '2026-10-01',
    endDate: '2027-01-31',
    participants: 42,
  },
  {
    id: 'prog-2',
    kind: 'competition',
    name: 'Ramadan Poster Competition',
    university: 'Cairo University, Faculty of Fine Arts',
    description: 'Design a Ramadan poster with Arabic calligraphy. The top three are published on TILT.',
    startDate: '2026-11-15',
    endDate: '2027-01-10',
    resultsDate: '2027-01-25',
    prize: 'EGP 20,000 and a one-year TILT plan',
    participants: 0,
  },
  {
    id: 'prog-3',
    kind: 'competition',
    name: 'Alexandria Motion Challenge',
    university: 'Alexandria University, Faculty of Fine Arts',
    description: 'A 15-second motion piece about Alexandria.',
    startDate: '2026-09-01',
    endDate: '2026-10-15',
    resultsDate: '2026-11-01',
    prize: 'EGP 10,000',
    participants: 67,
  },
];
