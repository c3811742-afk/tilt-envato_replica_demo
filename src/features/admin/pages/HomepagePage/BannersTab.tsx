import { useState } from 'react';
import { deleteBanner, fetchBanners } from '@/features/admin/api';
import { scheduleStatusTone } from '@/features/admin/constants';
import { useAdminAction, useAdminSession } from '@/features/admin/hooks';
import type { Banner } from '@/features/admin/types';
import { fromDateKey, localized, removeById, scheduleStatus, toDateKey, upsertById } from '@/features/admin/utils';
import { AsyncContent, Badge, Button, ConfirmModal, EmptyState, Icon, Notice, type RecordColumn, recordRows, Stack, Table, Text } from '@/shared/components';
import { useAsync, useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { fillText, formatDate, isolate } from '@/shared/utils';
import { BannerModal } from './BannerModal';

// The strip at the top of the homepage. Each banner shows only between its dates.
export const BannersTab = () => {
  const { text, locale } = useLocale();
  const { currentAdmin } = useAdminSession();
  const banners = useAsync(fetchBanners, []);
  const action = useAdminAction();
  const [editing, setEditing] = useState<Banner | 'new' | null>(null);
  const [deleting, setDeleting] = useState<Banner | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const t = text.admin.homepage.banners;
  const today = toDateKey();
  const current = banners.status === 'success' ? banners.data : [];
  const day = (key: string) => formatDate(fromDateKey(key), locale);

  const remove = async () => {
    if (!deleting) return;
    const result = await action.run(() => deleteBanner(currentAdmin.id, deleting.id));
    if (!result.ok) return;
    banners.update(removeById(current, deleting.id));
    setDeleting(null);
    setNotice(t.deleted);
  };

  const columns: RecordColumn<Banner>[] = [
    {
      key: 'banner',
      label: text.admin.columns.banner,
      render: (banner) => (
        <Stack gap={vars.spacing[1]}>
          <Text as="span" autoDirection>
            {localized(banner.text, locale)}
          </Text>
          <Text as="span" variant="bodySm" color={vars.colors.textMuted}>
            <bdi>{banner.link}</bdi>
          </Text>
        </Stack>
      ),
    },
    {
      key: 'dates',
      label: text.admin.columns.dates,
      render: (banner) =>
        fillText(text.admin.common.dateRange, { start: day(banner.startDate), end: day(banner.endDate) }),
    },
    {
      key: 'status',
      label: text.admin.columns.status,
      render: (banner) => {
        const status = scheduleStatus(banner, today);
        return <Badge variant={scheduleStatusTone[status]}>{text.admin.schedule[status]}</Badge>;
      },
    },
    {
      key: 'actions',
      label: text.admin.columns.actions,
      render: (banner) => (
        <Stack direction="row" gap={vars.spacing[2]}>
          <Button size="sm" variant="outline" iconOnly tooltip={text.admin.common.edit} onClick={() => setEditing(banner)}>
            <Icon name="pencil" size={vars.sizes.icon.sm} />
          </Button>
          <Button
            size="sm"
            variant="danger"
            iconOnly
            tooltip={text.admin.common.delete}
            tooltipAlign="end"
            onClick={() => {
              action.clearError();
              setDeleting(banner);
            }}
          >
            <Icon name="trash" size={vars.sizes.icon.sm} />
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
      <AsyncContent
        state={banners}
        empty={<EmptyState title={t.emptyTitle} message={t.emptyMessage} action={addButton} />}
      >
        {(list) => <Table label={t.tableLabel} columns={columns} rows={recordRows(list, (banner) => banner.id, columns)} stackOnMobile />}
      </AsyncContent>
      {editing && (
        <BannerModal
          banner={editing === 'new' ? undefined : editing}
          onClose={() => setEditing(null)}
          onSaved={(saved) => {
            banners.update(
              upsertById(current, saved).sort((a, b) => a.startDate.localeCompare(b.startDate)),
            );
            setEditing(null);
            setNotice(fillText(t.saved, { text: isolate(localized(saved.text, locale)) }));
          }}
        />
      )}
      {deleting && (
        <ConfirmModal
          title={t.deleteTitle}
          confirmLabel={text.admin.common.delete}
          tone="danger"
          message={t.deleteMessage}
          pending={action.busy}
          error={action.error}
          onConfirm={remove}
          onClose={() => setDeleting(null)}
        >
          <Text autoDirection>
            <strong>{localized(deleting.text, locale)}</strong>
          </Text>
        </ConfirmModal>
      )}
    </Stack>
  );
};
