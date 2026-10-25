import type { ModalActionsProps } from './ModalActions.types';

export const modalActionsDefaults: Required<Pick<ModalActionsProps, 'submit' | 'tone' | 'busy' | 'disabled'>> = {
  submit: false,
  tone: 'primary',
  busy: false,
  disabled: false,
};
