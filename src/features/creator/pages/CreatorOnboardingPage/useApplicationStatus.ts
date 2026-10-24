import { useSyncExternalStore } from 'react';
import type { CreatorApplicationReceipt } from '@/shared/types';
import { applicationsSnapshot, creatorApplicationStatus, subscribeToApplications } from '@/shared/utils';

// The admin team's decision on the application. Updates as soon as an admin decides, even in another tab.
export const useApplicationStatus = (receipt: CreatorApplicationReceipt) => {
  useSyncExternalStore(subscribeToApplications, applicationsSnapshot);
  return creatorApplicationStatus(receipt.id);
};
