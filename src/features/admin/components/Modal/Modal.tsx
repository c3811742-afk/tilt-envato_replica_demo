import { useEffect, useRef, type CSSProperties } from 'react';
import { Button, Text } from '@/shared/components';
import { useLocale } from '@/shared/hooks';
import { withDefaults } from '@/shared/utils';
import { modalDefaults } from './Modal.defaults';
import type { ModalProps } from './Modal.types';
import styles from './Modal.module.css';

// A dialog built on the native <dialog>: it traps focus, closes with Escape and dims the page.
export const Modal = (props: ModalProps) => {
  const { title, open, onClose, children, onSubmit, actions, width, maxHeight } = withDefaults(modalDefaults, props);
  const { text } = useLocale();
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const style = {
    '--modal-width': width,
    '--modal-max-height': maxHeight,
  } as CSSProperties;

  const body = (
    <>
      <div className={styles.body}>{children}</div>
      {actions && <div className={styles.actions}>{actions}</div>}
    </>
  );

  return (
    <dialog
      ref={dialogRef}
      className={styles.modal}
      style={style}
      aria-label={title}
      onCancel={(event) => {
        // Escape: let the parent decide, so `open` stays the single source of truth.
        event.preventDefault();
        onClose?.();
      }}
    >
      {open && (
        <div className={styles.content}>
          <div className={styles.header}>
            <Text as="h2" variant="h3">
              {title}
            </Text>
            {onClose && (
              <Button variant="muted" size="sm" onClick={onClose}>
                {text.common.close}
              </Button>
            )}
          </div>
          {onSubmit ? (
            <form className={styles.body} noValidate onSubmit={onSubmit}>
              {body}
            </form>
          ) : (
            body
          )}
        </div>
      )}
    </dialog>
  );
};
