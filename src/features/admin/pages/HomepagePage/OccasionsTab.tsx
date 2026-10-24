import { useState } from 'react';
import { deleteOccasion, fetchOccasions } from '@/features/admin/api';
import {
  Badge,
  ConfirmModal,
  DataTable,
  Notice,
  Panel,
  Stack,
  TextField,
  type DataTableColumn,
} from '@/features/admin/components';
import { scheduleStatusTone } from '@/features/admin/constants';
import { useAdminAction, useAdminSession } from '@/features/admin/hooks';
import type { Occasion } from '@/features/admin/types';
import {
  fillText,
  fromDateKey,
  isolate,
  localized,
  nextOccasion,
  occasionOn,
  removeById,
  scheduleStatus,
  toDateKey,
  upsertById,
} from '@/features/admin/utils';
import { AsyncContent, Button, EmptyState, Text } from '@/shared/components';
import { useAsync, useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { formatDate } from '@/shared/utils';
import { OccasionModal } from './OccasionModal';

// The Egyptian occasions calendar. The homepage switches to an occasion's headline on its dates, on its own.
export const OccasionsTab = () => {
  const { text, locale } = useLocale();
  const { currentAdmin } = useAdminSession();
  const occasions = useAsync(fetchOccasions, []);
  const action = useAdminAction();
  const [editing, setEditing] = useState<Occasion | 'new' | null>(null);
  const [deleting, setDeleting] = useState<Occasion | null>(null);
  const [checkDate, setCheckDate] = useState(toDateKey());
  const [notice, setNotice] = useState<string | null>(null);
  const t = text.admin.homepage.occasions;
  const today = toDateKey();
  const current = occasions.status === 'success' ? occasions.data : [];
  const nameOf = (occasion: Occasion) => isolate(localized(occasion.name, locale));
  const day = (key: string) => formatDate(fromDateKey(key), locale);
  const byStart = (list: Occasion[]) => [...list].sort((a, b) => a.startDate.localeCompare(b.startDate));

  const remove = async () => {
    if (!deleting) return;
    const result = await action.run(() => deleteOccasion(currentAdmin.id, deleting.id));
    if (!result.ok) return;
    occasions.update(removeById(current, deleting.id));
    setNotice(fillText(t.deleted, { name: nameOf(deleting) }));
    setDeleting(null);
  };

  const columns: DataTableColumn<Occasion>[] = [
    {
      key: 'occasion',
      header: text.admin.columns.occasion,
      render: (occasion) => (
        <Stack gap={vars.spacing[1]}>
          <Text as="span" autoDirection>
            {localized(occasion.name, locale)}
          </Text>
          <Text as="span" variant="bodySm" color={vars.colors.textMuted} autoDirection>
            {localized(occasion.headline, locale)}
          </Text>
        </Stack>
      ),
    },
    {
      key: 'dates',
      header: text.admin.columns.dates,
      render: (occasion) =>
        fillText(text.admin.common.dateRange, { start: day(occasion.startDate), end: day(occasion.endDate) }),
    },
    {
      key: 'status',
      header: text.admin.columns.status,
      render: (occasion) => {
        const status = scheduleStatus(occasion, today);
        return <Badge tone={scheduleStatusTone[status]}>{text.admin.schedule[status]}</Badge>;
      },
    },
    {
      key: 'actions',
      header: text.admin.columns.actions,
      render: (occasion) => (
        <Stack direction="row" gap={vars.spacing[2]}>
          <Button size="sm" variant="muted" onClick={() => setEditing(occasion)}>
            {text.admin.common.edit}
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => {
              action.clearError();
              setDeleting(occasion);
            }}
          >
            {text.admin.common.delete}
          </Button>
        </Stack>
      ),
    },
  ];

  const addButton = <Button onClick={() => setEditing('new')}>{t.add}</Button>;
  const showing = (occasion: Occasion | null) =>
    occasion
      ? fillText(t.showsOccasion, { name: nameOf(occasion), headline: isolate(localized(occasion.headline, locale)) })
      : t.showsDefault;

  return (
    <Stack>
      <Stack direction="row" align="center">
        <Text color={vars.colors.textMuted}>{t.description}</Text>
        {current.length > 0 && addButton}
      </Stack>
      {notice && (
        <Notice tone="success" onDismiss={() => setNotice(null)}>
          {notice}
        </Notice>
      )}
      <AsyncContent
        state={occasions}
        empty={<EmptyState title={t.emptyTitle} message={t.emptyMessage} action={addButton} />}
      >
        {(list) => {
          const next = nextOccasion(list, today);
          return (
            <Stack>
              <Panel title={t.todayTitle}>
                <Text>{showing(occasionOn(list, today))}</Text>
                {next && (
                  <Text color={vars.colors.textMuted}>
                    {fillText(t.nextUp, { name: nameOf(next), date: day(next.startDate) })}
                  </Text>
                )}
                <TextField type="date" label={t.checkDateLabel} value={checkDate} onChange={setCheckDate} />
                {checkDate && <Text>{showing(occasionOn(list, checkDate))}</Text>}
              </Panel>
              <DataTable label={t.tableLabel} columns={columns} rows={list} getRowKey={(occasion) => occasion.id} />
            </Stack>
          );
        }}
      </AsyncContent>
      {editing && (
        <OccasionModal
          occasion={editing === 'new' ? undefined : editing}
          onClose={() => setEditing(null)}
          onSaved={(saved) => {
            occasions.update(byStart(upsertById(current, saved)));
            setEditing(null);
            setNotice(fillText(t.saved, { name: nameOf(saved) }));
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
            <strong>{localized(deleting.name, locale)}</strong>
          </Text>
        </ConfirmModal>
      )}
    </Stack>
  );
};
