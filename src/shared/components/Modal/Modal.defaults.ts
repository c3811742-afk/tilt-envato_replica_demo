import { vars } from '@/shared/theme';
import type { ModalProps } from './Modal.types';

export const modalDefaults: Required<Pick<ModalProps, 'open' | 'width' | 'placement'>> = {
  open: false,
  placement: 'center',
  width: vars.sizes.modal.width,
};
