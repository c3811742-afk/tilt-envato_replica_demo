import { useState, type FormEvent } from 'react';
import { saveArticle } from '@/features/admin/api';
import { LocalizedField, Modal, Notice, SelectField } from '@/features/admin/components';
import { articleStatuses } from '@/features/admin/constants';
import { useAdminAction, useAdminSession } from '@/features/admin/hooks';
import type { Article, ArticleKind, ArticleStatus } from '@/features/admin/types';
import { emptyLocalized, hasErrors, isOneOf, localizedErrors } from '@/features/admin/utils';
import { Button } from '@/shared/components';
import { useLocale } from '@/shared/hooks';

interface ArticleModalProps {
  kind: ArticleKind;
  article?: Article; // editing; adding when missing
  labels: { add: string; editTitle: string }; // the wording of the tab (article or post)
  onClose: () => void;
  onSaved: (article: Article) => void;
}

// One editor for Help Center articles, Learn articles and What's New posts.
// A draft only needs its titles; publishing needs the text in both languages too.
export const ArticleModal = ({ kind, article, labels, onClose, onSaved }: ArticleModalProps) => {
  const { text } = useLocale();
  const { currentAdmin } = useAdminSession();
  const { run, pending, error } = useAdminAction();
  const t = text.admin.content.article;
  const [title, setTitle] = useState(article?.title ?? emptyLocalized());
  const [body, setBody] = useState(article?.body ?? emptyLocalized());
  const [status, setStatus] = useState<ArticleStatus>(article?.status ?? 'draft');
  const [submitted, setSubmitted] = useState(false);
  const errors = {
    title: localizedErrors(title, text),
    body: status === 'published' ? localizedErrors(body, text) : {},
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    if (hasErrors(errors.title) || hasErrors(errors.body)) return;
    const result = await run(() => saveArticle(currentAdmin.id, { kind, title, body, status }, article?.id));
    if (result.ok) onSaved(result.data);
  };

  return (
    <Modal
      open
      title={article ? labels.editTitle : labels.add}
      onClose={onClose}
      onSubmit={handleSubmit}
      actions={
        <>
          <Button variant="muted" onClick={onClose}>
            {text.common.cancel}
          </Button>
          <Button type="submit" disabled={pending}>
            {status === 'published' ? t.saveAndPublish : t.saveDraft}
          </Button>
        </>
      }
    >
      {error && <Notice tone="danger">{error}</Notice>}
      <LocalizedField
        label={t.titleLabel}
        value={title}
        onChange={setTitle}
        errors={submitted ? errors.title : {}}
        required
      />
      <LocalizedField
        label={t.bodyLabel}
        hint={t.bodyHint}
        value={body}
        onChange={setBody}
        multiline
        errors={submitted ? errors.body : {}}
      />
      <SelectField
        label={t.statusLabel}
        options={articleStatuses.map((value) => ({ value, label: t.statuses[value] }))}
        value={status}
        onChange={(value) => isOneOf(articleStatuses, value) && setStatus(value)}
      />
    </Modal>
  );
};
