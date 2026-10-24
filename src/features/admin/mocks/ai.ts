import type { BlockedGeneration } from '@/features/admin/types';

export const seedBlockedGenerations: BlockedGeneration[] = [
  {
    id: 'bl-1',
    at: '2026-10-22T20:14:00Z',
    userName: 'quickdeals@example.com',
    tool: 'image',
    stage: 'prompt',
    excerpt: 'photo of a famous Egyptian actor endorsing…',
    rule: 'realPeople',
  },
  {
    id: 'bl-2',
    at: '2026-10-21T13:02:00Z',
    userName: 'Omar Zaki',
    tool: 'image',
    stage: 'output',
    excerpt: 'Image flagged as violent',
    rule: 'violence',
  },
  {
    id: 'bl-3',
    at: '2026-10-20T09:40:00Z',
    userName: 'هدى إبراهيم',
    tool: 'voice',
    stage: 'prompt',
    excerpt: 'اكتب منشورًا يسخر من…',
    rule: 'hate',
  },
  {
    id: 'bl-4',
    at: '2026-10-18T17:25:00Z',
    userName: 'Sherif Nabil',
    tool: 'image',
    stage: 'prompt',
    excerpt: 'fake banknote with…',
    rule: 'phrase',
  },
];
