import { useState } from 'react';
import { deleteFaq, fetchFaqs, moveFaq } from '@/features/admin/api';
import { ConfirmModal, Notice, ReorderButtons } from '@/features/admin/components';
import { useAdminAction, useAdminSession } from '@/features/admin/hooks';
import type { Faq, MoveDirection } from '@/features/admin/types';
import { fillText, isolate, localized, removeById, upsertById } from '@/features/admin/utils';
import {
  AsyncContent,
  Button,
  EmptyState,
  type RecordColumn,
  recordRows,
  Stack,
  Table,
  Text,
} from '@/shared/components';
import { useAsync, useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { FaqModal } from './FaqModal';

// Questions shown on the FAQ page, in this order.
export const FaqsTab = () => {
  const { text, locale } = useLocale();
  const { currentAdmin } = useAdminSession();
  const faqs = useAsync(fetchFaqs, []);
  const action = useAdminAction();
  const [editing, setEditing] = useState<Faq | 'new' | null>(null);
  const [deleting, setDeleting] = useState<Faq | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const t = text.admin.content.faqs;
  const current = faqs.status === 'success' ? faqs.data : [];

  const move = async (faq: Faq, direction: MoveDirection) => {
    setNotice(null);
    const result = await action.run(() => moveFaq(currentAdmin.id, faq.id, direction));
    if (result.ok) faqs.update(result.data);
  };

  const remove = async () => {
    if (!deleting) return;
    const result = await action.run(() => deleteFaq(currentAdmin.id, deleting.id));
    if (!result.ok) return;
    faqs.update(removeById(current, deleting.id));
    setDeleting(null);
    setNotice(t.deleted);
  };

  const columns: RecordColumn<Faq>[] = [
    {
      key: 'question',
      label: text.admin.columns.question,
      render: (faq) => (
        <Stack gap={vars.spacing[1]}>
          <Text as="span" autoDirection>
            <strong>{localized(faq.question, locale)}</strong>
          </Text>
          <Text as="span" variant="bodySm" color={vars.colors.textMuted} autoDirection>
            {localized(faq.group, locale)}
          </Text>
          <Text as="span" variant="bodySm" color={vars.colors.textMuted} autoDirection>
            {localized(faq.answer, locale)}
          </Text>
        </Stack>
      ),
    },
    {
      key: 'order',
      label: text.admin.columns.order,
      render: (faq) => {
        const index = current.indexOf(faq);
        return (
          <ReorderButtons
            label={fillText(text.admin.common.moveLabel, { name: isolate(localized(faq.question, locale)) })}
            canMoveUp={index > 0}
            canMoveDown={index < current.length - 1}
            disabled={action.pending}
            onMove={(direction) => move(faq, direction)}
          />
        );
      },
    },
    {
      key: 'actions',
      label: text.admin.columns.actions,
      render: (faq) => (
        <Stack direction="row" wrap gap={vars.spacing[2]}>
          <Button size="sm" variant="muted" onClick={() => setEditing(faq)}>
            {text.admin.common.edit}
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => {
              action.clearError();
              setDeleting(faq);
            }}
          >
            {text.admin.common.delete}
          </Button>
        </Stack>
      ),
    },
  ];

  const addButton = <Button onClick={() => setEditing('new')}>{t.add}</Button>;

  return (
    <Stack>
      <Stack direction="row" wrap align="center">
        <Text color={vars.colors.textMuted}>{t.description}</Text>
        {current.length > 0 && addButton}
      </Stack>
      {notice && (
        <Notice tone="success" onDismiss={() => setNotice(null)}>
          {notice}
        </Notice>
      )}
      {action.error && !deleting && (
        <Notice tone="danger" onDismiss={action.clearError}>
          {action.error}
        </Notice>
      )}
      <AsyncContent state={faqs} empty={<EmptyState title={t.emptyTitle} message={t.emptyMessage} action={addButton} />}>
        {(list) => <Table label={t.tableLabel} columns={columns} rows={recordRows(list, (faq) => faq.id, columns)} stackOnMobile />}
      </AsyncContent>
      {editing && (
        <FaqModal
          faq={editing === 'new' ? undefined : editing}
          onClose={() => setEditing(null)}
          onSaved={(saved) => {
            faqs.update(upsertById(current, saved));
            setEditing(null);
            setNotice(t.saved);
          }}
        />
      )}
      {deleting && (
        <ConfirmModal
          title={t.deleteTitle}
          confirmLabel={text.admin.common.delete}
          tone="danger"
          message={t.deleteMessage}
          pending={action.pending}
          error={action.error}
          onConfirm={remove}
          onClose={() => setDeleting(null)}
        >
          <Text autoDirection>
            <strong>{localized(deleting.question, locale)}</strong>
          </Text>
        </ConfirmModal>
      )}
    </Stack>
  );
};
