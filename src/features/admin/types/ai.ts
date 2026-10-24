export type AiToolKey = 'imageGeneration' | 'backgroundRemoval' | 'arabicCopywriting' | 'textToSpeech' | 'videoUpscale';

// An AI tool, the model behind it, and the plans that can use it.
export interface AiTool {
  key: AiToolKey;
  model: string;
  enabled: boolean; // off: no plan can use it
  planIds: string[];
}

export type GenerationType = 'imageStandard' | 'imageHd' | 'backgroundRemoval' | 'copy' | 'voiceMinute' | 'upscale';

export interface GenerationCost {
  type: GenerationType;
  credits: number;
}

export type ContentRuleKey = 'explicit' | 'religiousFigures' | 'realPeople' | 'hate' | 'violence' | 'brands';

// What the AI tools refuse. Prompts are checked before generating and outputs before they're shown.
export interface ContentRules {
  rules: Record<ContentRuleKey, boolean>;
  blockedPhrases: string[];
}

export type BlockedStage = 'prompt' | 'output';

export interface BlockedGeneration {
  id: string;
  at: string;
  userName: string;
  tool: AiToolKey;
  stage: BlockedStage;
  excerpt: string;
  rule: ContentRuleKey | 'phrase';
}
