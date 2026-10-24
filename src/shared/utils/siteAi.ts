import { aiCredits, aiModelCredits, aiModels, aiTools, aiVideoModelCredits, storageKeys, type AiTool } from '@/shared/constants';
import { mockPlans } from '@/shared/mocks';
import type { AiCostKey, AiSettings, BlockedGeneration } from '@/shared/types';
import { createStoredValue } from './storedValue';

// AI Studio as the team set it up in the admin: tools on or off by plan, credit costs and content rules.

const toolModels: Record<AiTool, string> = {
  image: 'TILT Image 2',
  graphics: 'TILT Image 2',
  mockup: 'TILT Image 1',
  edit: 'TILT Image 2',
  backgroundRemove: 'Cutout 1.4',
  erase: 'Cutout 1.4',
  upscale: 'Upscale 2',
  video: 'TILT Motion 2',
  music: 'Tarab 1',
  voice: 'Voice Arabic 3',
  soundEffect: 'Foley 1',
};

const builtIn = (): AiSettings => ({
  tools: aiTools.map((key) => ({ key, model: toolModels[key], enabled: true, planIds: mockPlans.map((plan) => plan.id) })),
  costs: {},
  contentRules: {
    rules: { explicit: true, religiousFigures: true, realPeople: true, hate: true, violence: true, brands: false },
    blockedPhrases: ['nude', 'عاري', 'fake banknote'],
  },
});

const isSettings = (value: unknown): value is AiSettings =>
  typeof value === 'object' && value !== null && 'tools' in value && 'costs' in value && 'contentRules' in value;

export const aiSettingsStore = createStoredValue<AiSettings>(storageKeys.aiSettings, isSettings, builtIn);

// AI Studio's own credit costs, before the team changes any.
export const defaultAiCosts: Record<AiCostKey, number> = { ...aiCredits, ...aiModelCredits, ...aiVideoModelCredits };
export const aiCostKeys = Object.keys(defaultAiCosts) as AiCostKey[];

// What one unit of something costs now, in credits.
export const aiCost = (key: AiCostKey) => aiSettingsStore.get().costs[key] ?? defaultAiCosts[key];

export const aiToolSetting = (tool: AiTool) => aiSettingsStore.get().tools.find((setting) => setting.key === tool);

// Tools shown in AI Studio (the team can turn a tool off).
export const isAiToolOn = (tool: AiTool) => aiToolSetting(tool)?.enabled !== false;

// The blocked phrase a prompt contains, if any (in any language, ignoring case).
export const blockedPhraseIn = (prompt: string) => {
  const lower = prompt.toLocaleLowerCase();
  return aiSettingsStore.get().contentRules.blockedPhrases.find((phrase) => phrase.trim() && lower.includes(phrase.toLocaleLowerCase()));
};

const isList = <T>(value: unknown): value is T[] => Array.isArray(value);
export const aiBlockedStore = createStoredValue<BlockedGeneration[]>(storageKeys.aiBlocked, isList, () => []);

export const isAiModel = (value: string) => (aiModels as readonly string[]).includes(value);
