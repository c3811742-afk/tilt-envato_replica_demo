import type { AiContentRules, AiCostKey, AiToolSetting } from '@/shared/types';

// AI Studio's own settings (see shared/types/aiSettings.ts): what the admin saves is what AI Studio uses.
export type { BlockedGeneration, BlockedStage, ContentRuleKey } from '@/shared/types';
export type { AiTool as AiToolKey } from '@/shared/constants';
export type AiTool = AiToolSetting;
export type GenerationType = AiCostKey;
export type ContentRules = AiContentRules;

export interface GenerationCost {
  type: GenerationType;
  credits: number;
}
