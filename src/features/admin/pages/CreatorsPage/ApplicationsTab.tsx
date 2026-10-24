import { useState } from 'react';
import { decideCreatorApplication, fetchCreatorApplications } from '@/features/admin/api';
import { Notice } from '@/features/admin/components';
import { applicationRejectReasons, applicationStatusTone } from '@/features/admin/constants';
import { useAdminAction, useAdminSession } from '@/features/admin/hooks';
import type { CreatorApplication } from '@/features/admin/types';
import { fillText, formatList, isolate, replaceById } from '@/features/admin/utils';
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
import { useAsync, useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { formatDate, isCategoryId } from '@/shared/utils';
import { DecisionModal } from './DecisionModal';

// People asking to sell on TILT, from the "Become an author" form. Waiting ones first.
export const ApplicationsTab = () => {
  const { text, locale } = useLocale();
  const { currentAdmin } = useAdminSession();
  const applications = useAsync(fetchCreatorApplications, []);
  const { run, pending, error, clearError } = useAdminAction();
  const [opened, setOpened] = useState<CreatorApplication | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const t = text.admin.creators;

  const categoriesOf = (application: CreatorApplication) =>
    formatList(
      application.categories.map((id) => (isCategoryId(id) ? text.categories[id].name : id)),
      locale,
    );

  const columns: RecordColumn<CreatorApplication>[] = [
    {
      key: 'name',
      label: text.admin.columns.name,
      render: (application) => (
        <Stack gap={vars.spacing[1]}>
          <Text as="span" autoDirection>
            {application.name}
          </Text>
          <Text as="span" variant="bodySm" color={vars.colors.textMuted}>
            <bdi>{application.email}</bdi>
          </Text>
        </Stack>
      ),
    },
    { key: 'program', label: t.program, render: (application) => t.programs[application.program] },
    { key: 'categories', label: t.categories, render: (application) => (application.categories.length ? categoriesOf(application) : text.admin.common.none) },
    { key: 'received', label: text.admin.columns.received, render: (application) => formatDate(application.at, locale) },
    {
      key: 'status',
      label: text.admin.columns.status,
      render: (application) => <Badge variant={applicationStatusTone[application.status]}>{t.statuses[application.status]}</Badge>,
    },
    {
      key: 'actions',
      label: text.admin.columns.actions,
      align: 'end',
      render: (application) => (
        <Button
          size="sm"
          variant="muted"
          onClick={() => {
            clearError();
            setOpened(application);
          }}
        >
          {application.status === 'pending' ? t.review : t.view}
        </Button>
      ),
    },
  ];

  return (
    <Stack>
      <Text color={vars.colors.textMuted}>{t.applicationsDescription}</Text>
      {notice && (
        <Notice tone="success" onDismiss={() => setNotice(null)}>
          {notice}
        </Notice>
      )}
      <AsyncContent state={applications} empty={<EmptyState title={t.noApplicationsTitle} message={t.noApplicationsMessage} />}>
        {(list) => (
          <>
            <Table label={t.tabs.applications} columns={columns} rows={recordRows(list, (application) => application.id, columns)} stackOnMobile />
            {opened && (
              <DecisionModal
                title={t.applicationTitle}
                open={opened.status === 'pending'}
                details={[
                  { label: t.reference, value: <bdi>{opened.id}</bdi> },
                  {
                    label: text.admin.columns.name,
                    value: (
                      <Text as="span" autoDirection>
                        {opened.name} <bdi>({opened.email})</bdi>
                      </Text>
                    ),
                  },
                  { label: t.program, value: t.programs[opened.program] },
                  { label: opened.program === 'author' ? t.portfolio : t.website, value: <TextLink href={opened.portfolio}>{opened.portfolio}</TextLink> },
                  ...(opened.categories.length ? [{ label: t.categories, value: categoriesOf(opened) }] : []),
                  ...(opened.message ? [{ label: t.message, value: <Text as="span" autoDirection>{opened.message}</Text> }] : []),
                  { label: text.admin.columns.received, value: formatDate(opened.at, locale) },
                  { label: t.sourceLabel, value: text.admin.users.sources[opened.source] },
                  { label: text.admin.columns.status, value: <Badge variant={applicationStatusTone[opened.status]}>{t.statuses[opened.status]}</Badge> },
                  ...(opened.decision?.reason ? [{ label: text.admin.columns.reason, value: t.applicationReasons[opened.decision.reason] }] : []),
                  ...(opened.decision
                    ? [{ label: t.decidedBy, value: fillText(t.decidedByValue, { name: isolate(opened.decision.adminName), date: formatDate(opened.decision.at, locale) }) }]
                    : []),
                ]}
                reasons={applicationRejectReasons}
                reasonLabels={t.applicationReasons}
                pending={pending}
                error={error}
                onClose={() => setOpened(null)}
                onDecide={async (input) => {
                  const result = await run(() => decideCreatorApplication(currentAdmin.id, opened.id, input));
                  if (!result.ok) return;
                  applications.update(replaceById(list, result.data));
                  setOpened(null);
                  setNotice(fillText(input.approve ? t.approved : t.rejected, { name: isolate(result.data.name) }));
                }}
              />
            )}
          </>
        )}
      </AsyncContent>
    </Stack>
  );
};
