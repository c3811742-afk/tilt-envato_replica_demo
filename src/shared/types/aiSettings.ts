import type { AiModelId, AiTool, AiVideoModelId, aiCredits } from '@/shared/constants';
import type { PlanId } from './account';

// What the admin team controls in AI Studio.

// One AI Studio tool: on or off, the model behind it, and the plans that include it.
export interface AiToolSetting {
  key: AiTool;
  model: string; // shown to the team
  enabled: boolean; // off: no plan can use it, and it leaves AI Studio
  planIds: PlanId[];
}

// Everything AI Studio charges credits for: an image or video model, or a tool's fixed cost.
export type AiCostKey = keyof typeof aiCredits | AiModelId | AiVideoModelId;

export type ContentRuleKey = 'explicit' | 'religiousFigures' | 'realPeople' | 'hate' | 'violence' | 'brands';

// What AI Studio refuses to make. Prompts with a blocked phrase are refused before generating.
export interface AiContentRules {
  rules: Record<ContentRuleKey, boolean>;
  blockedPhrases: string[];
}

export interface AiSettings {
  tools: AiToolSetting[];
  costs: Partial<Record<AiCostKey, number>>; // the team's credit costs; missing ones use AI Studio's own
  contentRules: AiContentRules;
}

export type BlockedStage = 'prompt' | 'output';

// A generation that was refused.
export interface BlockedGeneration {
  id: string;
  at: string;
  userName: string;
  tool: AiTool;
  stage: BlockedStage;
  excerpt: string;
  rule: ContentRuleKey | 'phrase';
}
