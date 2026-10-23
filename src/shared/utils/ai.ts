import { aiGeneration, aiModelCredits, type AiAspectRatio, type AiModelId } from '@/shared/constants';
import { mockPlans } from '@/shared/mocks';
import type { Generation, Subscription } from '@/shared/types';
import { monthStart } from './library';
import { isSubscriptionActive } from './session';

export type GenerationStatus = 'queued' | 'running' | 'done';

// Credits a request costs: per image, more on newer models.
export const generationCost = (model: AiModelId, count: number) => aiModelCredits[model] * count;

const generationMs = (generation: Pick<Generation, 'count'>) =>
  (aiGeneration.baseSeconds + aiGeneration.secondsPerImage * generation.count) * 1000;

export interface GenerationTiming {
  startsAt: number; // ms
  endsAt: number; // ms
}

// When each generation runs: up to `concurrent` at the same time, the rest wait in order.
export const scheduleGenerations = (generations: Generation[], concurrent: number): Map<string, GenerationTiming> => {
  const slots = new Array<number>(Math.max(1, concurrent)).fill(0);
  const timings = new Map<string, GenerationTiming>();
  for (const generation of [...generations].sort((a, b) => a.createdAt.localeCompare(b.createdAt))) {
    const slot = slots.indexOf(Math.min(...slots));
    const startsAt = Math.max(new Date(generation.createdAt).getTime(), slots[slot]);
    const endsAt = startsAt + generationMs(generation);
    slots[slot] = endsAt;
    timings.set(generation.id, { startsAt, endsAt });
  }
  return timings;
};

export const generationStatus = (timing: GenerationTiming | undefined, now: number): GenerationStatus => {
  if (!timing || now < timing.startsAt) return 'queued';
  return now < timing.endsAt ? 'running' : 'done';
};

export interface CreditAllowance {
  total: number; // credits this month
  used: number;
  remaining: number;
  resetsAt: string | null;
  concurrent: number; // generations that run at the same time
  models: AiModelId[];
}

// The AI credits the user's plan gives this month, and what's left. No plan: no credits.
export const creditAllowance = (generations: Generation[], subscription: Subscription | null, now: Date = new Date()): CreditAllowance => {
  const plan = subscription && isSubscriptionActive(subscription, now) ? mockPlans.find((candidate) => candidate.id === subscription.planId) : undefined;
  if (!subscription || !plan) return { total: 0, used: 0, remaining: 0, resetsAt: null, concurrent: 0, models: [] };
  const since = monthStart(subscription, now);
  const used = generations.filter((generation) => new Date(generation.createdAt) >= since).reduce((total, generation) => total + generation.credits, 0);
  const resets = new Date(since);
  resets.setMonth(resets.getMonth() + 1);
  return {
    total: subscription.credits,
    used,
    remaining: Math.max(0, subscription.credits - used),
    resetsAt: resets.toISOString(),
    concurrent: plan.concurrentGenerations,
    models: plan.models,
  };
};

const aspectSizes: Record<AiAspectRatio, { width: number; height: number }> = {
  square: { width: 512, height: 512 },
  landscape: { width: 640, height: 384 },
  portrait: { width: 384, height: 640 },
};

// The demo's generated image: abstract art drawn from the prompt and seed (the same request draws the same picture).
// Drawing coordinates are SVG user units, not CSS sizes.
export const generatedImage = (prompt: string, seed: number, index: number, aspect: AiAspectRatio) => {
  let state = [...`${prompt}:${seed}:${index}`].reduce((hash, char) => (Math.imul(hash, 31) + char.charCodeAt(0)) | 0, 7);
  const random = () => {
    state = (Math.imul(state ^ (state >>> 15), 2246822507) + 12345) | 0;
    return ((state >>> 0) % 10000) / 10000;
  };
  const { width, height } = aspectSizes[aspect];
  const hue = Math.floor(random() * 360);
  const color = (shift: number, light: number) => `hsl(${(hue + shift) % 360} 70% ${light}%)`;
  const shapes = Array.from({ length: 7 }, (_, shape) => {
    const x = random() * width;
    const y = random() * height;
    const size = (0.15 + random() * 0.35) * Math.min(width, height);
    const fill = color(shape * 40, 35 + random() * 40);
    return random() > 0.5
      ? `<circle cx="${x}" cy="${y}" r="${size / 2}" fill="${fill}" opacity="0.85"/>`
      : `<rect x="${x - size / 2}" y="${y - size / 2}" width="${size}" height="${size}" fill="${fill}" opacity="0.85" transform="rotate(${random() * 90} ${x} ${y})"/>`;
  }).join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}"><rect width="100%" height="100%" fill="${color(180, 12)}"/>${shapes}</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};
