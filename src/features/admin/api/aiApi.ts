import type { Admin, AiTool, ContentRules, GenerationCost } from '@/features/admin/types';
import { texts } from '@/shared/constants';
import { aiBlockedStore, aiCostKeys, aiSettingsStore, defaultAiCosts } from '@/shared/utils';
import { authorize, db, logAction, respond } from './mockServer';
import { allPlans } from './plansApi';

// AI Studio's settings: what is saved here is what AI Studio offers, charges and refuses.

const logAi = (actor: Admin, area: 'aiTools' | 'aiCosts' | 'aiRules') => {
  const labels = { en: texts.en.admin.audit.areas[area], ar: texts.ar.admin.audit.areas[area] };
  logAction(actor, 'aiSettingsSaved', { kind: 'ai', id: area, label: labels.en, labels }, { area });
};

const settings = () => aiSettingsStore.get();

// The AI tools, and the plans they can be turned on for.
export const fetchAiTools = () =>
  respond(() => ({
    tools: settings().tools,
    plans: allPlans().map((plan) => ({ id: plan.id, name: plan.name, active: plan.active })),
  }));

export const saveAiTools = (actorId: string, tools: AiTool[]) =>
  respond(() => {
    const actor = authorize(actorId, 'manageAi');
    aiSettingsStore.set({ ...settings(), tools: structuredClone(tools) });
    logAi(actor, 'aiTools');
    return settings().tools;
  });

// Every credit cost AI Studio charges, with the team's changes.
const currentCosts = (): GenerationCost[] =>
  aiCostKeys.map((type) => ({ type, credits: settings().costs[type] ?? defaultAiCosts[type] }));

export const fetchGenerationCosts = () => respond(currentCosts);

// Only costs that differ from AI Studio's own are kept, so later changes to the defaults still apply.
export const saveGenerationCosts = (actorId: string, costs: GenerationCost[]) =>
  respond(() => {
    const actor = authorize(actorId, 'manageAi');
    const changed = Object.fromEntries(costs.filter((cost) => cost.credits !== defaultAiCosts[cost.type]).map((cost) => [cost.type, cost.credits]));
    aiSettingsStore.set({ ...settings(), costs: changed });
    logAi(actor, 'aiCosts');
    return currentCosts();
  });

// Blocked prompts from AI Studio in this browser, and the demo's examples. Newest first.
export const fetchContentRules = () =>
  respond(() => ({
    rules: settings().contentRules,
    blocked: [...aiBlockedStore.get(), ...db.blockedGenerations].sort((a, b) => b.at.localeCompare(a.at)),
  }));

// Each phrase is kept once, ignoring upper and lower case.
export const saveContentRules = (actorId: string, rules: ContentRules) =>
  respond(() => {
    const actor = authorize(actorId, 'manageAi');
    const phrases = rules.blockedPhrases.map((phrase) => phrase.trim()).filter(Boolean);
    const unique = phrases.filter(
      (phrase, index) => phrases.findIndex((other) => other.toLocaleLowerCase() === phrase.toLocaleLowerCase()) === index,
    );
    aiSettingsStore.set({ ...settings(), contentRules: { rules: { ...rules.rules }, blockedPhrases: unique } });
    logAi(actor, 'aiRules');
    return settings().contentRules;
  });
