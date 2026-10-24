import { useState } from 'react';
import { cancelAnnouncement, fetchAnnouncements } from '@/features/admin/api';
import { ConfirmModal, Notice } from '@/features/admin/components';
import { messageStatusTone } from '@/features/admin/constants';
import { useAdminAction, useAdminSession } from '@/features/admin/hooks';
import type { Announcement } from '@/features/admin/types';
import { fillText, isolate, replaceById } from '@/features/admin/utils';
import {
  AsyncContent,
  Badge,
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
import { formatDate, formatNumber } from '@/shared/utils';
import { AnnouncementModal } from './AnnouncementModal';

const dateTime: Intl.DateTimeFormatOptions = { dateStyle: 'medium', timeStyle: 'short' };

// Announcements to customers, creators or both: shown on the site and sent by email.
export const AnnouncementsTab = () => {
  const { text, locale } = useLocale();
  const { currentAdmin } = useAdminSession();
  const announcements = useAsync(fetchAnnouncements, []);
  const action = useAdminAction();
  const [writing, setWriting] = useState(false);
  const [canceling, setCanceling] = useState<Announcement | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const t = text.admin.messages.announcements;
  const current = announcements.status === 'success' ? announcements.data : [];

  const cancel = async () => {
    if (!canceling) return;
    const result = await action.run(() => cancelAnnouncement(currentAdmin.id, canceling.id));
    if (!result.ok) return;
    announcements.update(replaceById(current, result.data));
    setCanceling(null);
    setNotice(fillText(t.canceled, { title: isolate(result.data.title) }));
  };

  const handleSent = (announcement: Announcement) => {
    announcements.update([announcement, ...current]);
    setWriting(false);
    const values = {
      title: isolate(announcement.title),
      count: formatNumber(announcement.recipients, locale),
      date: formatDate(announcement.sendAt, locale, dateTime),
    };
    setNotice(fillText(announcement.status === 'scheduled' ? t.scheduled : t.sent, values));
  };

  const columns: RecordColumn<Announcement>[] = [
    {
      key: 'message',
      label: text.admin.columns.message,
      render: (announcement) => (
        <Stack gap={vars.spacing[1]}>
          <Text as="span" autoDirection>
            <strong>{announcement.title}</strong>
          </Text>
          <Text as="span" variant="bodySm" color={vars.colors.textMuted} autoDirection>
            {announcement.body}
          </Text>
        </Stack>
      ),
    },
    {
      key: 'audience',
      label: text.admin.columns.audience,
      render: (announcement) => t.audiences[announcement.audience],
    },
    {
      key: 'recipients',
      label: text.admin.columns.recipients,
      render: (announcement) => formatNumber(announcement.recipients, locale),
    },
    {
      key: 'date',
      label: text.admin.columns.date,
      render: (announcement) => formatDate(announcement.sendAt, locale, dateTime),
    },
    {
      key: 'status',
      label: text.admin.columns.status,
      render: (announcement) => (
        <Badge variant={messageStatusTone[announcement.status]}>{t.statuses[announcement.status]}</Badge>
      ),
    },
    {
      key: 'actions',
      label: text.admin.columns.actions,
      render: (announcement) =>
        announcement.status === 'scheduled' && (
          <Button
            size="sm"
            variant="muted"
            onClick={() => {
              action.clearError();
              setCanceling(announcement);
            }}
          >
            {t.cancelSending}
          </Button>
        ),
    },
  ];

  const newButton = <Button onClick={() => setWriting(true)}>{t.new}</Button>;

  return (
    <Stack>
      <Stack direction="row" wrap align="center">
        <Text color={vars.colors.textMuted}>{t.description}</Text>
        {current.length > 0 && newButton}
      </Stack>
      {notice && (
        <Notice tone="success" onDismiss={() => setNotice(null)}>
          {notice}
        </Notice>
      )}
      <AsyncContent
        state={announcements}
        empty={<EmptyState title={t.emptyTitle} message={t.emptyMessage} action={newButton} />}
      >
        {(list) => (
          <Table label={t.tableLabel} columns={columns} rows={recordRows(list, (announcement) => announcement.id, columns)} stackOnMobile />
        )}
      </AsyncContent>
      {writing && <AnnouncementModal onClose={() => setWriting(false)} onSent={handleSent} />}
      {canceling && (
        <ConfirmModal
          title={t.cancelTitle}
          confirmLabel={t.cancelSending}
          tone="danger"
          message={t.cancelMessage}
          pending={action.pending}
          error={action.error}
          onConfirm={cancel}
          onClose={() => setCanceling(null)}
        >
          <Text autoDirection>
            <strong>{canceling.title}</strong>
          </Text>
        </ConfirmModal>
      )}
    </Stack>
  );
};
