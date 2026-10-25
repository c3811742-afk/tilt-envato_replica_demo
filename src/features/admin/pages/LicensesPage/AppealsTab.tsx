import { useState } from 'react';
import { fetchElementAppeals } from '@/features/admin/api';
import { appealStatusTone } from '@/features/admin/constants';
import type { ElementAppeal } from '@/features/admin/types';
import { replaceById } from '@/features/admin/utils';
import { AsyncContent, Badge, Button, EmptyState, Notice, type RecordColumn, recordRows, Stack, Table, Text } from '@/shared/components';
import { useAsync, useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { fillText, formatDate, isolate } from '@/shared/utils';
import { AppealModal } from './AppealModal';

// Creators' appeals against copyright takedowns. Open ones first.
export const AppealsTab = () => {
  const { text, locale } = useLocale();
  const appeals = useAsync(fetchElementAppeals, []);
  const [opened, setOpened] = useState<ElementAppeal | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const t = text.admin.elementAppeals;

  const columns: RecordColumn<ElementAppeal>[] = [
    {
      key: 'element',
      label: text.admin.columns.element,
      render: (appeal) => (
        <Text as="span" autoDirection>
          {appeal.element.title}
        </Text>
      ),
    },
    {
      key: 'creator',
      label: text.admin.columns.creator,
      render: (appeal) => (
        <Text as="span" autoDirection>
          {appeal.creator.name}
        </Text>
      ),
    },
    { key: 'received', label: text.admin.columns.received, render: (appeal) => formatDate(appeal.receivedAt, locale) },
    {
      key: 'status',
      label: text.admin.columns.status,
      render: (appeal) => <Badge variant={appealStatusTone[appeal.status]}>{t.statuses[appeal.status]}</Badge>,
    },
    {
      key: 'actions',
      label: text.admin.columns.actions,
      align: 'end',
      render: (appeal) => (
        <Button size="sm" variant="muted" onClick={() => setOpened(appeal)}>
          {t.open}
        </Button>
      ),
    },
  ];

  return (
    <Stack>
      <Text color={vars.colors.textMuted}>{t.description}</Text>
      {notice && (
        <Notice tone="success" onDismiss={() => setNotice(null)}>
          {notice}
        </Notice>
      )}
      <AsyncContent state={appeals} empty={<EmptyState title={t.emptyTitle} message={t.emptyMessage} />}>
        {(list) => (
          <>
            <Table label={t.tableLabel} columns={columns} rows={recordRows(list, (appeal) => appeal.id, columns)} stackOnMobile />
            {opened && (
              <AppealModal
                appeal={opened}
                onClose={() => setOpened(null)}
                onDecided={(saved) => {
                  appeals.update(replaceById(list, saved));
                  setOpened(null);
                  if (saved.status !== 'open') setNotice(fillText(t.done[saved.status], { title: isolate(saved.element.title) }));
                }}
              />
            )}
          </>
        )}
      </AsyncContent>
    </Stack>
  );
};
