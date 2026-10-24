import type { AiTool, BlockedGeneration, ContentRules, GenerationCost } from '@/features/admin/types';

export const seedAiTools: AiTool[] = [
  {
    key: 'imageGeneration',
    model: 'TILT Image 2',
    enabled: true,
    planIds: ['plan-student', 'plan-starter', 'plan-pro', 'plan-team'],
  },
  {
    key: 'backgroundRemoval',
    model: 'Cutout 1.4',
    enabled: true,
    planIds: ['plan-starter', 'plan-pro', 'plan-team'],
  },
  { key: 'arabicCopywriting', model: 'Arabic Writer 2', enabled: true, planIds: ['plan-pro', 'plan-team'] },
  { key: 'textToSpeech', model: 'Voice Arabic 3', enabled: true, planIds: ['plan-pro', 'plan-team'] },
  { key: 'videoUpscale', model: 'Upscale Video 1', enabled: false, planIds: ['plan-team'] },
];

export const seedGenerationCosts: GenerationCost[] = [
  { type: 'imageStandard', credits: 2 },
  { type: 'imageHd', credits: 5 },
  { type: 'backgroundRemoval', credits: 1 },
  { type: 'copy', credits: 1 },
  { type: 'voiceMinute', credits: 4 },
  { type: 'upscale', credits: 10 },
];

export const seedContentRules: ContentRules = {
  rules: {
    explicit: true,
    religiousFigures: true,
    realPeople: true,
    hate: true,
    violence: true,
    brands: false,
  },
  blockedPhrases: ['nude', 'عاري', 'fake banknote'],
};

export const seedBlockedGenerations: BlockedGeneration[] = [
  {
    id: 'bl-1',
    at: '2026-10-22T20:14:00Z',
    userName: 'quickdeals@example.com',
    tool: 'imageGeneration',
    stage: 'prompt',
    excerpt: 'photo of a famous Egyptian actor endorsing…',
    rule: 'realPeople',
  },
  {
    id: 'bl-2',
    at: '2026-10-21T13:02:00Z',
    userName: 'Omar Zaki',
    tool: 'imageGeneration',
    stage: 'output',
    excerpt: 'Image flagged as violent',
    rule: 'violence',
  },
  {
    id: 'bl-3',
    at: '2026-10-20T09:40:00Z',
    userName: 'هدى إبراهيم',
    tool: 'arabicCopywriting',
    stage: 'prompt',
    excerpt: 'اكتب منشورًا يسخر من…',
    rule: 'hate',
  },
  {
    id: 'bl-4',
    at: '2026-10-18T17:25:00Z',
    userName: 'Sherif Nabil',
    tool: 'imageGeneration',
    stage: 'prompt',
    excerpt: 'fake banknote with…',
    rule: 'phrase',
  },
];
