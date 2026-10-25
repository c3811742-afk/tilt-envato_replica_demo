import { vars } from '@/shared/theme';
import { withDefaults } from '@/shared/utils';
import { Modal } from '../Modal';
import { ModalActions } from '../ModalActions';
import { Notice } from '../Notice';
import { Text } from '../Text';
import { confirmModalDefaults } from './ConfirmModal.defaults';
import type { ConfirmModalProps } from './ConfirmModal.types';

// Asks before an action that is hard to undo (delete, remove, send, ban). Built on Modal and ModalActions.
export const ConfirmModal = (props: ConfirmModalProps) => {
  const { title, confirmLabel, message, children, tone, pending, error, onConfirm, onClose } = withDefaults(confirmModalDefaults, props);

  return (
    <Modal open title={title} onClose={onClose} actions={<ModalActions confirmLabel={confirmLabel} tone={tone} busy={pending} onCancel={onClose} onConfirm={onConfirm} />}>
      {children}
      {message && <Text color={vars.colors.textMuted}>{message}</Text>}
      {error && <Notice tone="danger">{error}</Notice>}
    </Modal>
  );
};
