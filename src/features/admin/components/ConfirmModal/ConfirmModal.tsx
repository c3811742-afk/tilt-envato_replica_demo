import { Button, Modal, Text } from '@/shared/components';
import { useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { withDefaults } from '@/shared/utils';

import { Notice } from '../Notice';
import { confirmModalDefaults } from './ConfirmModal.defaults';
import type { ConfirmModalProps } from './ConfirmModal.types';

// Asks before an action that is hard to undo (send, delete, ban). Built on Modal, so it has no CSS of its own.
export const ConfirmModal = (props: ConfirmModalProps) => {
  const { title, confirmLabel, message, children, tone, pending, error, onConfirm, onClose } = withDefaults(
    confirmModalDefaults,
    props,
  );
  const { text } = useLocale();

  return (
    <Modal
      open
      title={title}
      onClose={onClose}
      actions={
        <>
          <Button variant="muted" onClick={onClose}>
            {text.common.cancel}
          </Button>
          <Button variant={tone} disabled={pending} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      {children}
      {message && <Text color={vars.colors.textMuted}>{message}</Text>}
      {error && <Notice tone="danger">{error}</Notice>}
    </Modal>
  );
};
