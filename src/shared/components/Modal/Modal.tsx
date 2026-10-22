import { useEffect, useId, useRef, type CSSProperties } from 'react';
import { useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { withDefaults } from '@/shared/utils';
import { Icon } from '../Icon';
import { Stack } from '../Stack';
import { Text } from '../Text';
import { modalDefaults } from './Modal.defaults';
import type { ModalProps } from './Modal.types';
import styles from './Modal.module.css';

// A dialog built on the native <dialog>: focus is trapped inside and Esc closes it.
export const Modal = (props: ModalProps) => {
  const { open, onClose, title, children, actions, width, closeLabel } = withDefaults(modalDefaults, props);
  const { text } = useLocale();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const style = { '--modal-width': width } as CSSProperties;

  return (
    <dialog
      ref={dialogRef}
      className={styles.modal}
      style={style}
      aria-labelledby={title ? titleId : undefined}
      onClose={onClose}
      onClick={(event) => {
        // A click on the dialog element itself (not its content) is a click on the backdrop.
        if (event.target === dialogRef.current) onClose?.();
      }}
    >
      {open && (
        <div className={styles.content}>
          <div className={styles.header}>
            {title && (
              <Text as="h2" variant="h3" id={titleId}>
                {title}
              </Text>
            )}
            <button type="button" className={styles.close} aria-label={closeLabel ?? text.common.close} onClick={onClose}>
              <Icon name="close" />
            </button>
          </div>
          <Stack gap={vars.spacing[4]}>{children}</Stack>
          {actions && <div className={styles.actions}>{actions}</div>}
        </div>
      )}
    </dialog>
  );
};
