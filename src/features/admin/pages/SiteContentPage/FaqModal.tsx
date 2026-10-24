import { useState, type FormEvent } from 'react';
import { saveFaq } from '@/features/admin/api';
import { LocalizedField, Notice } from '@/features/admin/components';
import { useAdminAction, useAdminSession } from '@/features/admin/hooks';
import type { Faq } from '@/features/admin/types';
import { emptyLocalized, hasErrors, localizedErrors } from '@/features/admin/utils';
import { Button, Modal } from '@/shared/components';
import { useLocale } from '@/shared/hooks';

interface FaqModalProps {
  faq?: Faq; // editing; adding when missing
  onClose: () => void;
  onSaved: (faq: Faq) => void;
}

export const FaqModal = ({ faq, onClose, onSaved }: FaqModalProps) => {
  const { text } = useLocale();
  const { currentAdmin } = useAdminSession();
  const { run, pending, error } = useAdminAction();
  const t = text.admin.content.faqs;
  const [group, setGroup] = useState(faq?.group ?? emptyLocalized());
  const [question, setQuestion] = useState(faq?.question ?? emptyLocalized());
  const [answer, setAnswer] = useState(faq?.answer ?? emptyLocalized());
  const [submitted, setSubmitted] = useState(false);
  const errors = { group: localizedErrors(group, text), question: localizedErrors(question, text), answer: localizedErrors(answer, text) };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    if (hasErrors(errors.group) || hasErrors(errors.question) || hasErrors(errors.answer)) return;
    const result = await run(() => saveFaq(currentAdmin.id, { group, question, answer }, faq?.id));
    if (result.ok) onSaved(result.data);
  };

  return (
    <Modal
      open
      title={faq ? t.editTitle : t.add}
      onClose={onClose}
      onSubmit={handleSubmit}
      actions={
        <>
          <Button variant="muted" onClick={onClose}>
            {text.common.cancel}
          </Button>
          <Button type="submit" disabled={pending}>
            {faq ? text.common.saveChanges : t.add}
          </Button>
        </>
      }
    >
      {error && <Notice tone="danger">{error}</Notice>}
      <LocalizedField
        label={t.groupLabel}
        hint={t.groupHint}
        value={group}
        onChange={setGroup}
        errors={submitted ? errors.group : {}}
        required
      />
      <LocalizedField
        label={t.questionLabel}
        value={question}
        onChange={setQuestion}
        errors={submitted ? errors.question : {}}
        required
      />
      <LocalizedField
        label={t.answerLabel}
        value={answer}
        onChange={setAnswer}
        multiline
        errors={submitted ? errors.answer : {}}
        required
      />
    </Modal>
  );
};
