import {
  aiGeneration,
  aiModelCredits,
  aiOutputSizes,
  aiVideoModelCredits,
  type AiGraphicKind,
  type AiModelId,
  type AiStyle,
  type AiVideoModelId,
} from '@/shared/constants';
import { aiCost } from './siteAi';
import { findPlanById } from './siteSettings';
import type { AiRequest, Generation, Subscription } from '@/shared/types';
import { monthStart } from './library';
import { isSubscriptionActive } from './session';

export type GenerationStatus = 'queued' | 'running' | 'done';

const isImageModel = (model: string | undefined): model is AiModelId => model !== undefined && model in aiModelCredits;
const isVideoModel = (model: string | undefined): model is AiVideoModelId => model !== undefined && model in aiVideoModelCredits;

// How many images an image request makes: the chosen count, or the burst's variations.
export const imageOutputCount = (request: Pick<AiRequest, 'count' | 'burst'>) => (request.burst ? aiGeneration.burstCount : (request.count ?? 1));

// Credits a request costs, shown before generating: per image (more on newer models), per second of video
// (more at 1080p and with sound), per length of music or text read out, or a fixed price per edit.
export const generationCost = (request: AiRequest) => {
  const { tool } = request;
  switch (tool) {
    case 'image':
      if (request.burst) return aiCost('burst');
      return (isImageModel(request.model) ? aiCost(request.model) : 1) * (request.count ?? 1);
    case 'video': {
      const seconds = request.duration ?? aiGeneration.videoDurations[0];
      const perSecond =
        (isVideoModel(request.model) ? aiCost(request.model) : 1) +
        (request.resolution === '1080p' ? aiCost('videoHighResolutionPerSecond') : 0) +
        (request.audio ? aiCost('videoAudioPerSecond') : 0);
      return perSecond * seconds;
    }
    case 'music':
      return aiCost('musicPerTenSeconds') * Math.ceil((request.duration ?? aiGeneration.musicDurations[0]) / 10);
    case 'voice':
      return aiCost('voicePerHundredCharacters') * Math.max(1, Math.ceil(request.prompt.trim().length / 100));
    case 'graphics':
      return aiCost('graphics') * (request.count ?? 1);
    default:
      return aiCost(tool);
  }
};

// How long a request takes in the demo queue.
const generationMs = (generation: Generation) => {
  const extra = generation.tool === 'video' || generation.tool === 'music' ? (generation.duration ?? 0) / 2 : aiGeneration.secondsPerImage * Math.max(1, generation.outputs.length);
  return (aiGeneration.baseSeconds + extra) * 1000;
};

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
  videoModels: AiVideoModelId[];
}

// The AI credits the user's plan gives this month, and what's left. No plan: no credits.
export const creditAllowance = (generations: Generation[], subscription: Subscription | null, now: Date = new Date()): CreditAllowance => {
  const plan = subscription && isSubscriptionActive(subscription, now) ? findPlanById(subscription.planId) : undefined;
  if (!subscription || !plan) return { total: 0, used: 0, remaining: 0, resetsAt: null, concurrent: 0, models: [], videoModels: [] };
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
    videoModels: plan.videoModels,
  };
};

// A new random seed for a generation (the same seed draws the same result).
export const newSeed = () => Math.floor(Math.random() * 1_000_000);

// A repeatable random number generator: the same text gives the same numbers (0 to 1).
export const seededRandom = (text: string) => {
  let state = [...text].reduce((hash, char) => (Math.imul(hash, 31) + char.charCodeAt(0)) | 0, 7);
  return () => {
    state = (Math.imul(state ^ (state >>> 15), 2246822507) + 12345) | 0;
    return ((state >>> 0) % 10000) / 10000;
  };
};

// The hue (0-360) of a hex color, e.g. a reference image's main color.
const hueOf = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((start) => parseInt(hex.slice(start, start + 2), 16) / 255);
  const max = Math.max(r, g, b);
  const delta = max - Math.min(r, g, b);
  if (!delta) return 0;
  const hue = max === r ? ((g - b) / delta) % 6 : max === g ? (b - r) / delta + 2 : (r - g) / delta + 4;
  return Math.round((hue * 60 + 360) % 360);
};

const svgUrl = (width: number, height: number, body: string, defs = '') =>
  `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}"><defs>${defs}</defs>${body}</svg>`,
  )}`;

// How each style draws its shapes.
const styleLooks: Record<AiStyle, { background: number; saturation: number; opacity: number; stroke: boolean; blur: boolean; shading: boolean }> = {
  photo: { background: 30, saturation: 45, opacity: 0.75, stroke: false, blur: true, shading: true },
  illustration: { background: 85, saturation: 70, opacity: 1, stroke: true, blur: false, shading: false },
  threeD: { background: 20, saturation: 60, opacity: 1, stroke: false, blur: false, shading: true },
  flat: { background: 92, saturation: 65, opacity: 1, stroke: false, blur: false, shading: false },
  watercolor: { background: 96, saturation: 55, opacity: 0.45, stroke: false, blur: true, shading: false },
  neon: { background: 6, saturation: 100, opacity: 0.9, stroke: true, blur: false, shading: false },
};

// The demo's generated image: art drawn from the prompt, seed and style (the same request draws the same picture).
// A reference image's color (tint) sets the colors. Drawing coordinates are SVG user units, not CSS sizes.
export const generatedImage = (request: Pick<AiRequest, 'prompt' | 'aspect' | 'style' | 'tint'> & { seed: number }, index: number) => {
  const random = seededRandom(`${request.prompt}:${request.seed}:${index}`);
  const { width, height } = aiOutputSizes[request.aspect ?? 'square'];
  const look = styleLooks[request.style ?? 'photo'];
  const hue = request.tint ? hueOf(request.tint) : Math.floor(random() * 360);
  const color = (shift: number, light: number) => `hsl(${(hue + shift) % 360} ${look.saturation}% ${light}%)`;
  const defs = `${look.blur ? '<filter id="soft"><feGaussianBlur stdDeviation="14"/></filter>' : ''}<radialGradient id="shade" cx="35%" cy="30%"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#000" stop-opacity=".35"/></radialGradient>`;
  const shapes = Array.from({ length: 8 }, (_, shape) => {
    const x = random() * width;
    const y = random() * height;
    const size = (0.15 + random() * 0.35) * Math.min(width, height);
    const fill = color(shape * 35, look.background > 50 ? 40 + random() * 25 : 45 + random() * 30);
    const paint = look.stroke && request.style === 'neon' ? `fill="none" stroke="${fill}" stroke-width="6"` : `fill="${fill}"${look.stroke ? ' stroke="#111" stroke-width="4"' : ''}`;
    const extra = `opacity="${look.opacity}"${look.blur ? ' filter="url(#soft)"' : ''}`;
    const body =
      random() > 0.5
        ? `<circle cx="${x}" cy="${y}" r="${size / 2}" ${paint} ${extra}/>`
        : `<rect x="${x - size / 2}" y="${y - size / 2}" width="${size}" height="${size}" ${paint} ${extra} transform="rotate(${random() * 90} ${x} ${y})"/>`;
    const shading = look.shading ? body.replace(/fill="[^"]*"/, 'fill="url(#shade)"').replace(/ stroke="[^"]*" stroke-width="\d+"/, '') : '';
    return body + shading;
  }).join('');
  return svgUrl(width, height, `<rect width="100%" height="100%" fill="${color(180, look.background)}"/>${shapes}`, defs);
};

// A generated graphic: a single icon, a repeating pattern, or a badge.
export const generatedGraphic = (request: Pick<AiRequest, 'prompt' | 'tint'> & { seed: number; kind: AiGraphicKind }, index: number) => {
  const random = seededRandom(`${request.prompt}:${request.seed}:${index}:${request.kind}`);
  const size = aiOutputSizes.square.width;
  const hue = request.tint ? hueOf(request.tint) : Math.floor(random() * 360);
  const main = `hsl(${hue} 70% 45%)`;
  const second = `hsl(${(hue + 150) % 360} 70% 60%)`;
  const glyph = (cx: number, cy: number, r: number) => {
    const points = 3 + Math.floor(random() * 4);
    return `<polygon points="${Array.from({ length: points * 2 }, (_, point) => {
      const angle = (Math.PI * point) / points;
      const radius = point % 2 ? r * 0.5 : r;
      return `${cx + radius * Math.sin(angle)},${cy - radius * Math.cos(angle)}`;
    }).join(' ')}" fill="${main}"/>`;
  };
  const body =
    request.kind === 'pattern'
      ? Array.from({ length: 16 }, (_, cell) => glyph((cell % 4) * (size / 4) + size / 8, Math.floor(cell / 4) * (size / 4) + size / 8, size / 12)).join('')
      : request.kind === 'badge'
        ? `<circle cx="${size / 2}" cy="${size / 2}" r="${size * 0.4}" fill="${second}"/><circle cx="${size / 2}" cy="${size / 2}" r="${size * 0.33}" fill="none" stroke="#fff" stroke-width="8"/>${glyph(size / 2, size / 2, size * 0.2)}`
        : `<rect x="${size * 0.2}" y="${size * 0.2}" width="${size * 0.6}" height="${size * 0.6}" rx="${size * 0.12}" fill="${second}"/>${glyph(size / 2, size / 2, size * 0.22)}`;
  return svgUrl(size, size, `<rect width="100%" height="100%" fill="#fff"/>${body}`);
};
