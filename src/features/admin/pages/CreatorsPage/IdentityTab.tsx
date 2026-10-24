import { useState } from 'react';
import { generatePath } from 'react-router';
import { decideIdentityCheck, fetchIdentityChecks } from '@/features/admin/api';
import { Notice } from '@/features/admin/components';
import { applicationStatusTone, idRejectReasons } from '@/features/admin/constants';
import { useAdminAction, useAdminSession } from '@/features/admin/hooks';
import type { IdentityCheck } from '@/features/admin/types';
import { fillText, fromDateKey, isolate, replaceById } from '@/features/admin/utils';
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
  TextLink,
} from '@/shared/components';
import { routes } from '@/shared/constants';
import { useAsync, useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { formatDate } from '@/shared/utils';
import { DecisionModal } from './DecisionModal';

const isExpired = (check: IdentityCheck) => fromDateKey(check.expiresAt).getTime() < Date.now();

// Creators' ID documents, checked before their first payout. Waiting ones first.
export const IdentityTab = () => {
  const { text, locale } = useLocale();
  const { currentAdmin } = useAdminSession();
  const checks = useAsync(fetchIdentityChecks, []);
  const { run, pending, error, clearError } = useAdminAction();
  const [opened, setOpened] = useState<IdentityCheck | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const t = text.admin.creators;

  const expiry = (check: IdentityCheck) => (
    <Stack gap={vars.spacing[1]} align="flex-start">
      <span>{formatDate(fromDateKey(check.expiresAt), locale)}</span>
      {isExpired(check) && <Badge variant="danger">{t.expired}</Badge>}
    </Stack>
  );

  const columns: RecordColumn<IdentityCheck>[] = [
    {
      key: 'creator',
      label: text.admin.columns.creator,
      render: (check) => (
        <TextLink to={generatePath(routes.adminUser, { userId: check.creator.id })} autoDirection>
          {check.creator.name}
        </TextLink>
      ),
    },
    { key: 'document', label: t.document, render: (check) => t.documents[check.document] },
    { key: 'expires', label: text.admin.columns.expires, render: expiry },
    { key: 'submitted', label: text.admin.columns.submitted, render: (check) => formatDate(check.submittedAt, locale) },
    {
      key: 'status',
      label: text.admin.columns.status,
      render: (check) => <Badge variant={applicationStatusTone[check.status]}>{t.statuses[check.status]}</Badge>,
    },
    {
      key: 'actions',
      label: text.admin.columns.actions,
      align: 'end',
      render: (check) => (
        <Button
          size="sm"
          variant="muted"
          onClick={() => {
            clearError();
            setOpened(check);
          }}
        >
          {check.status === 'pending' ? t.review : t.view}
        </Button>
      ),
    },
  ];

  return (
    <Stack>
      <Text color={vars.colors.textMuted}>{t.identityDescription}</Text>
      {notice && (
        <Notice tone="success" onDismiss={() => setNotice(null)}>
          {notice}
        </Notice>
      )}
      <AsyncContent state={checks} empty={<EmptyState title={t.noChecksTitle} message={t.noChecksMessage} />}>
        {(list) => (
          <>
            <Table label={t.tabs.identity} columns={columns} rows={recordRows(list, (check) => check.id, columns)} stackOnMobile />
            {opened && (
              <DecisionModal
                title={t.identityTitle}
                open={opened.status === 'pending'}
                details={[
                  {
                    label: t.nameOnAccount,
                    value: (
                      <Text as="span" autoDirection>
                        {opened.creator.name}
                      </Text>
                    ),
                  },
                  {
                    label: t.nameOnDocument,
                    value: (
                      <Text as="span" autoDirection>
                        {opened.nameOnDocument}
                      </Text>
                    ),
                  },
                  { label: t.document, value: t.documents[opened.document] },
                  { label: t.number, value: <bdi>{fillText(t.numberEnding, { digits: opened.numberEnding })}</bdi> },
                  { label: text.admin.columns.expires, value: expiry(opened) },
                  { label: text.admin.columns.submitted, value: formatDate(opened.submittedAt, locale) },
                  ...(opened.decision?.reason ? [{ label: text.admin.columns.reason, value: t.idReasons[opened.decision.reason] }] : []),
                  ...(opened.decision
                    ? [{ label: t.decidedBy, value: fillText(t.decidedByValue, { name: isolate(opened.decision.adminName), date: formatDate(opened.decision.at, locale) }) }]
                    : []),
                ]}
                reasons={idRejectReasons}
                reasonLabels={t.idReasons}
                pending={pending}
                error={error}
                onClose={() => setOpened(null)}
                onDecide={async (input) => {
                  const result = await run(() => decideIdentityCheck(currentAdmin.id, opened.id, input));
                  if (!result.ok) return;
                  checks.update(replaceById(list, result.data));
                  setOpened(null);
                  setNotice(fillText(input.approve ? t.idApproved : t.idRejected, { name: isolate(result.data.creator.name) }));
                }}
              />
            )}
          </>
        )}
      </AsyncContent>
    </Stack>
  );
};
