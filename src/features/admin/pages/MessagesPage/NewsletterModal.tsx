import { useState, type FormEvent } from 'react';
import { sendNewsletter } from '@/features/admin/api';
import { ConfirmModal } from '@/features/admin/components';
import { useAdminAction, useAdminSession } from '@/features/admin/hooks';
import type { Newsletter } from '@/features/admin/types';
import { fillText, hasErrors, isBlank } from '@/features/admin/utils';
import { Button, Modal, TextField } from '@/shared/components';
import { useLocale } from '@/shared/hooks';
import { formatNumber } from '@/shared/utils';

interface NewsletterModalProps {
  subscribers: number;
  onClose: () => void;
  onSent: (newsletter: Newsletter) => void;
}

// Write the newsletter, then confirm before it goes to every subscriber. Demo: nothing is really sent.
export const NewsletterModal = ({ subscribers, onClose, onSent }: NewsletterModalProps) => {
  const { text, locale } = useLocale();
  const { currentAdmin } = useAdminSession();
  const { run, pending, error } = useAdminAction();
  const t = text.admin.messages.newsletters;
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const errors = {
    subject: isBlank(subject) ? t.subjectRequired : undefined,
    body: isBlank(body) ? t.bodyRequired : undefined,
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    if (!hasErrors(errors)) setConfirming(true);
  };

  const send = async () => {
    const result = await run(() => sendNewsletter(currentAdmin.id, { subject, body }));
    if (result.ok) onSent(result.data);
  };

  if (confirming) {
    return (
      <ConfirmModal
        title={t.confirmTitle}
        confirmLabel={t.send}
        message={fillText(t.confirmMessage, { count: formatNumber(subscribers, locale) })}
        pending={pending}
        error={error}
        onConfirm={send}
        onClose={() => setConfirming(false)}
      />
    );
  }

  return (
    <Modal
      open
      title={t.newTitle}
      onClose={onClose}
      onSubmit={handleSubmit}
      actions={
        <>
          <Button variant="muted" onClick={onClose}>
            {text.common.cancel}
          </Button>
          <Button type="submit">{text.common.continue}</Button>
        </>
      }
    >
      <TextField
        label={t.subjectLabel}
        value={subject}
        onChange={setSubject}
        error={submitted ? errors.subject : undefined}
        required
      />
      <TextField rows={4}
        label={t.bodyLabel}
        value={body}
        onChange={setBody}
        error={submitted ? errors.body : undefined}
        required
      />
    </Modal>
  );
};
