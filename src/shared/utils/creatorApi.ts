import { creatorApplication, creatorApplicationStages } from '@/shared/constants';
import type { CreatorApplication, CreatorApplicationReceipt } from '@/shared/types';
import { respond, respondError } from './mockResponse';

const secondMs = 1000;

// Demo stand-in for the creator application server.
export const creatorApi = {
  submitApplication: (application: CreatorApplication) =>
    application.acceptAgreement
      ? respond<CreatorApplicationReceipt>({
          id: `APP-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
          submittedAt: new Date().toISOString(),
        })
      : respondError(new Error('The creator agreement was not accepted')),
};

// Where an application is now, and when it reached each stage (demo: one stage every few seconds).
export const creatorApplicationProgress = (receipt: CreatorApplicationReceipt, now: number) => {
  const submittedAt = new Date(receipt.submittedAt).getTime();
  const stageMs = creatorApplication.demoSecondsPerStage * secondMs;
  const last = creatorApplicationStages.length - 1;
  const current = Math.min(Math.max(Math.floor((now - submittedAt) / stageMs), 0), last);
  const reachedAt = creatorApplicationStages.map((_, index) => new Date(submittedAt + index * stageMs).toISOString());
  return { current, stage: creatorApplicationStages[current], reachedAt, isFinal: current === last };
};
