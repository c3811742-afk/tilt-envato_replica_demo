import { aiGeneration, aiLicense, aiModels, aiTools, aiVideoModels, type AiModelId, type AiTool, type AiVideoModelId } from '@/shared/constants';
import type { AiRequest, Generation, GenerationOutput, LicenseRecord } from '@/shared/types';
import { call, planAccess, readLicenses, saveAccount, signedInAccount, teamOf, toSessionAccount, writeLicenses } from './accountStore';
import { creditAllowance, generationCost, imageOutputCount, newSeed } from './ai';
import { ApiError } from './apiError';
import { fileStore } from './fileStore';
import { aiBlockedStore, aiToolAccess, aiToolSetting, blockedPhraseIn } from './siteAi';
import { createLicenseCode } from './license';

// A result the browser made for the request (an edited image, a video, music): kept in the browser's file store.
export interface GeneratedFile {
  kind: GenerationOutput['kind'];
  blob: Blob;
}

const isImageModel = (model: string): model is AiModelId => (aiModels as readonly string[]).includes(model);
const isVideoModel = (model: string): model is AiVideoModelId => (aiVideoModels as readonly string[]).includes(model);

// AI Studio: a request spends credits (the team's on a team plan), joins the queue (see scheduleGenerations),
// and gets a license, like a download.
export const aiApi = {
  generate: ({ request, files = [] }: { request: AiRequest; files?: GeneratedFile[] }) =>
    call(async () => {
      const account = signedInAccount();
      if (account.suspension) throw new ApiError('accountSuspended');
      const access = planAccess(account);
      const allowance = creditAllowance(access.pool.flatMap((member) => member.generations), access.subscription);
      if (!allowance.total) throw new ApiError('noAiAccess');
      // The team's settings (admin): the tool must be on, and included in the plan.
      const toolSetting = aiTools.includes(request.tool as AiTool) ? aiToolSetting(request.tool as AiTool) : undefined;
      const toolAccess = toolSetting ? aiToolAccess(toolSetting.key, access.subscription?.planId ?? null) : 'included';
      if (toolAccess === 'off') throw new ApiError('aiToolOff');
      if (toolAccess === 'notInPlan') throw new ApiError('aiToolNotInPlan');
      // Prompts with a blocked word are refused, and the team sees them in the admin.
      const blocked = blockedPhraseIn(request.prompt);
      if (blocked) {
        aiBlockedStore.set([
          {
            id: crypto.randomUUID(),
            at: new Date().toISOString(),
            userName: account.email,
            tool: (toolSetting?.key ?? 'image'),
            stage: 'prompt',
            excerpt: request.prompt.trim().slice(0, aiGeneration.promptMaxLength),
            rule: 'phrase',
          },
          ...aiBlockedStore.get(),
        ]);
        throw new ApiError('promptBlocked');
      }
      if (request.model && isImageModel(request.model) && !allowance.models.includes(request.model)) throw new ApiError('modelNotIncluded');
      if (request.model && isVideoModel(request.model) && !allowance.videoModels.includes(request.model)) throw new ApiError('modelNotIncluded');
      const credits = generationCost(request);
      if (credits > allowance.remaining) throw new ApiError('notEnoughCredits');

      const id = crypto.randomUUID();
      // Images and graphics are drawn from the request; anything the browser made is stored as a file.
      const stored = await Promise.all(
        files.map(async (file, index) => {
          const fileId = `${id}:${index}`;
          await fileStore.put(fileId, file.blob);
          return { kind: file.kind, fileId, mime: file.blob.type };
        }),
      );
      const drawn = request.tool === 'image' || request.tool === 'graphics' ? Array.from({ length: imageOutputCount(request) }, () => ({ kind: 'image' as const })) : [];
      const spoken = request.tool === 'voice' ? [{ kind: 'speech' as const }] : [];

      const prompt = request.prompt.trim().slice(0, request.tool === 'voice' ? aiGeneration.voiceMaxLength : aiGeneration.promptMaxLength);
      const team = access.viaTeam ? teamOf(account.id) : null;
      const license: LicenseRecord = {
        code: createLicenseCode(),
        itemId: `${aiLicense.itemPrefix}${id}`,
        itemTitle: prompt || request.sourceName || request.tool,
        creatorName: aiLicense.creatorName,
        licenseeName: team ? team.name : account.name,
        projectName: aiLicense.projectName,
        use: 'other',
        issuedAt: new Date().toISOString(),
        ownerId: account.id,
        teamId: team?.id,
      };
      writeLicenses([license, ...readLicenses()]);

      const generation: Generation = {
        ...request,
        prompt,
        id,
        credits,
        createdAt: new Date().toISOString(),
        seed: newSeed(),
        outputs: [...drawn, ...stored, ...spoken],
        licenseCode: license.code,
      };
      return toSessionAccount(saveAccount({ ...account, generations: [generation, ...account.generations] }));
    }),
};
