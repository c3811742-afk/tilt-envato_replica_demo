import type { Admin, AiTool, ContentRules, GenerationCost } from '@/features/admin/types';
import { texts } from '@/shared/constants';
import { authorize, db, logAction, respond } from './mockServer';

const logAi = (actor: Admin, area: 'aiTools' | 'aiCosts' | 'aiRules') => {
  const labels = { en: texts.en.admin.audit.areas[area], ar: texts.ar.admin.audit.areas[area] };
  logAction(actor, 'aiSettingsSaved', { kind: 'ai', id: area, label: labels.en, labels }, { area });
};

// The AI tools, and the plans they can be turned on for.
export const fetchAiTools = () =>
  respond(() => ({
    tools: db.aiTools,
    plans: db.plans.map((plan) => ({ id: plan.id, name: plan.name, active: plan.active })),
  }));

export const saveAiTools = (actorId: string, tools: AiTool[]) =>
  respond(() => {
    const actor = authorize(actorId, 'manageAi');
    db.aiTools = structuredClone(tools);
    logAi(actor, 'aiTools');
    return db.aiTools;
  });

export const fetchGenerationCosts = () => respond(() => db.generationCosts);

export const saveGenerationCosts = (actorId: string, costs: GenerationCost[]) =>
  respond(() => {
    const actor = authorize(actorId, 'manageAi');
    db.generationCosts = structuredClone(costs);
    logAi(actor, 'aiCosts');
    return db.generationCosts;
  });

export const fetchContentRules = () =>
  respond(() => ({
    rules: db.contentRules,
    blocked: [...db.blockedGenerations].sort((a, b) => b.at.localeCompare(a.at)),
  }));

// Each phrase is kept once, ignoring upper and lower case.
export const saveContentRules = (actorId: string, rules: ContentRules) =>
  respond(() => {
    const actor = authorize(actorId, 'manageAi');
    const phrases = rules.blockedPhrases.map((phrase) => phrase.trim()).filter(Boolean);
    const unique = phrases.filter(
      (phrase, index) => phrases.findIndex((other) => other.toLocaleLowerCase() === phrase.toLocaleLowerCase()) === index,
    );
    db.contentRules = { rules: { ...rules.rules }, blockedPhrases: unique };
    logAi(actor, 'aiRules');
    return db.contentRules;
  });
