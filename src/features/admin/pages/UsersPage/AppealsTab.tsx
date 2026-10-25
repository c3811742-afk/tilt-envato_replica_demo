import { useState } from 'react';
import { generatePath } from 'react-router';
import { fetchAppeals } from '@/features/admin/api';
import type { UserAccount } from '@/features/admin/types';
import { removeById } from '@/features/admin/utils';
import { AppealModal } from '@/features/admin/pages/UserPage';
import { AsyncContent, Button, EmptyState, Notice, type RecordColumn, recordRows, Stack, Table, Text, TextLink } from '@/shared/components';
import { routes } from '@/shared/constants';
import { useAsync, useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { fillText, formatDate, isolate } from '@/shared/utils';

// Appeals waiting for an answer, oldest first.
export const AppealsTab = () => {
  const { text, locale } = useLocale();
  const appeals = useAsync(fetchAppeals, []);
  const [opened, setOpened] = useState<UserAccount | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const t = text.admin.users;

  const columns: RecordColumn<UserAccount>[] = [
    {
      key: 'user',
      label: text.admin.columns.user,
      render: (user) => (
        <TextLink to={generatePath(routes.adminUser, { userId: user.id })} autoDirection>
          {user.name}
        </TextLink>
      ),
    },
    {
      key: 'reason',
      label: text.admin.columns.reason,
      render: (user) => (user.statusReason ? t.statusReasons[user.statusReason] : text.admin.common.none),
    },
    {
      key: 'message',
      label: t.appealMessage,
      render: (user) => (
        <Text as="span" autoDirection maxLines={2}>
          {user.appeal?.message}
        </Text>
      ),
    },
    { key: 'sent', label: t.appealSent, render: (user) => (user.appeal ? formatDate(user.appeal.at, locale) : '') },
    {
      key: 'actions',
      label: text.admin.columns.actions,
      align: 'end',
      render: (user) => (
        <Button size="sm" variant="muted" onClick={() => setOpened(user)}>
          {t.reviewAppeal}
        </Button>
      ),
    },
  ];

  return (
    <Stack>
      <Text color={vars.colors.textMuted}>{t.appealsDescription}</Text>
      {notice && (
        <Notice tone="success" onDismiss={() => setNotice(null)}>
          {notice}
        </Notice>
      )}
      <AsyncContent state={appeals} empty={<EmptyState title={t.noAppealsTitle} message={t.noAppealsMessage} />}>
        {(list) => (
          <>
            <Table label={t.tabs.appeals} columns={columns} rows={recordRows(list, (user) => user.id, columns)} stackOnMobile />
            {opened && (
              <AppealModal
                user={opened}
                onClose={() => setOpened(null)}
                onDecided={(saved, outcome) => {
                  appeals.update(removeById(list, saved.id));
                  setOpened(null);
                  setNotice(fillText(outcome === 'accepted' ? t.appealAccepted : t.appealRejected, { name: isolate(saved.name) }));
                }}
              />
            )}
          </>
        )}
      </AsyncContent>
    </Stack>
  );
};
