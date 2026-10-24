import type { ReasonModalProps } from './ReasonModal.types';

export const reasonModalDefaults: Required<Pick<ReasonModalProps<string>, 'tone' | 'pending'>> = {
  tone: 'danger',
  pending: false,
};
