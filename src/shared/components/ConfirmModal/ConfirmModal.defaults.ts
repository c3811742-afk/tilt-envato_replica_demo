import type { ConfirmModalProps } from './ConfirmModal.types';

export const confirmModalDefaults: Required<Pick<ConfirmModalProps, 'tone' | 'pending'>> = {
  tone: 'primary',
  pending: false,
};
