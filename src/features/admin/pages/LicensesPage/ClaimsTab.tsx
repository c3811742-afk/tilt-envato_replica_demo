import { useState } from 'react';
import { fetchClaims } from '@/features/admin/api';
import { claimStatusTone } from '@/features/admin/constants';
import type { CopyrightClaim } from '@/features/admin/types';
import { replaceById } from '@/features/admin/utils';
import { AsyncContent, Badge, Button, EmptyState, Notice, type RecordColumn, recordRows, Stack, Table, Text } from '@/shared/components';
import { useAsync, useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { fillText, formatDate, isolate } from '@/shared/utils';
import { ClaimModal } from './ClaimModal';

// Copyright (DMCA) claims about live elements. New ones first.
export const ClaimsTab = () => {
  const { text, locale } = useLocale();
  const claims = useAsync(fetchClaims, []);
  const [opened, setOpened] = useState<CopyrightClaim | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const t = text.admin.claims;

  const columns: RecordColumn<CopyrightClaim>[] = [
    {
      key: 'element',
      label: text.admin.columns.element,
      render: (claim) => (
        <Text as="span" autoDirection>
          {claim.element.title}
        </Text>
      ),
    },
    {
      key: 'claimant',
      label: t.claimantLabel,
      render: (claim) => (
        <Text as="span" autoDirection>
          {claim.claimant.company ?? claim.claimant.name}
        </Text>
      ),
    },
    { key: 'received', label: text.admin.columns.received, render: (claim) => formatDate(claim.receivedAt, locale) },
    {
      key: 'status',
      label: text.admin.columns.status,
      render: (claim) => <Badge variant={claimStatusTone[claim.status]}>{t.statuses[claim.status]}</Badge>,
    },
    {
      key: 'actions',
      label: text.admin.columns.actions,
      align: 'end',
      render: (claim) => (
        <Button size="sm" variant="muted" onClick={() => setOpened(claim)}>
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
      <AsyncContent state={claims} empty={<EmptyState title={t.emptyTitle} message={t.emptyMessage} />}>
        {(list) => (
          <>
            <Table label={t.tableLabel} columns={columns} rows={recordRows(list, (claim) => claim.id, columns)} stackOnMobile />
            {opened && (
              <ClaimModal
                claim={opened}
                onClose={() => setOpened(null)}
                onDecided={(saved) => {
                  claims.update(replaceById(list, saved));
                  setOpened(null);
                  setNotice(fillText(t.done[saved.status], { title: isolate(saved.element.title) }));
                }}
              />
            )}
          </>
        )}
      </AsyncContent>
    </Stack>
  );
};
