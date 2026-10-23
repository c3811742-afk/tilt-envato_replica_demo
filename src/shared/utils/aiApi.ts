import { aiGeneration, type AiAspectRatio, type AiModelId } from '@/shared/constants';
import type { Generation } from '@/shared/types';
import { call, signedInAccount, updateSignedIn } from './accountStore';
import { creditAllowance, generationCost } from './ai';
import { ApiError } from './apiError';

export interface GenerationRequest {
  prompt: string;
  model: AiModelId;
  count: number;
  aspect: AiAspectRatio;
}

// The AI image tool: a request spends credits and joins the user's queue (see scheduleGenerations).
export const aiApi = {
  generate: ({ prompt, model, count, aspect }: GenerationRequest) =>
    call(() => {
      const account = signedInAccount();
      const allowance = creditAllowance(account.generations, account.subscription);
      if (!allowance.total) throw new ApiError('noAiAccess');
      if (!allowance.models.includes(model)) throw new ApiError('modelNotIncluded');
      const credits = generationCost(model, count);
      if (credits > allowance.remaining) throw new ApiError('notEnoughCredits');
      const generation: Generation = {
        id: crypto.randomUUID(),
        prompt: prompt.trim().slice(0, aiGeneration.promptMaxLength),
        model,
        count,
        aspect,
        credits,
        createdAt: new Date().toISOString(),
        seed: Math.floor(Math.random() * 1_000_000),
      };
      return updateSignedIn((current) => ({ generations: [generation, ...current.generations] }));
    }),
};
