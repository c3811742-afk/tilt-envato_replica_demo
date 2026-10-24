import { useNow } from '@/shared/hooks';
import type { CreatorApplicationReceipt } from '@/shared/types';
import { creatorApplicationProgress } from '@/shared/utils';

// The application's stage, checked again every tick until it's approved.
export const useApplicationProgress = (receipt: CreatorApplicationReceipt) => {
  const now = useNow((time) => !creatorApplicationProgress(receipt, time).isFinal);
  return creatorApplicationProgress(receipt, now);
};
