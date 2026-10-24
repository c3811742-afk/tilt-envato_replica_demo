import { useState } from 'react';
import { useParams } from 'react-router';
import { fetchUser } from '@/features/admin/api';
import { RequirePermission } from '@/features/admin/components';
import { accountStatusTone, userDetailTabs } from '@/features/admin/constants';
import type { StatusAction, UserAccount, UserDetails } from '@/features/admin/types';
import { AsyncContent, Badge, Button, Card, DetailList, Notice, SectionHeader, Stack, Tabs, Text, TextLink } from '@/shared/components';
import { routes } from '@/shared/constants';
import { useAsync, useLocale, useTabParam } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { fillText, formatDate, isolate } from '@/shared/utils';
import { AppealModal } from './AppealModal';
import { DownloadsTable, LicensesTable, SubscriptionsTable, GenerationsTable } from './UserTables';
import { StatusModal } from './StatusModal';

// Which status changes each status allows.
const actionsFor: Record<UserAccount['status'], StatusAction[]> = {
  active: ['suspend', 'ban'],
  suspended: ['reactivate', 'ban'],
  banned: ['reactivate'],
};

interface UserViewProps {
  details: UserDetails;
  onChange: (account: UserAccount) => void;
}

const UserView = ({ details, onChange }: UserViewProps) => {
  const { text, locale } = useLocale();
  const [tab, setTab] = useTabParam(userDetailTabs);
  const [action, setAction] = useState<StatusAction | null>(null);
  const [reviewingAppeal, setReviewingAppeal] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const { account } = details;
  const t = text.admin.users;
  const name = isolate(account.name);
  const appealWaiting = account.status !== 'active' && account.appeal && !account.appeal.rejectedAt;

  const saved = (next: UserAccount, message: string) => {
    onChange(next);
    setAction(null);
    setReviewingAppeal(false);
    setNotice(fillText(message, { name }));
  };

  const tables = {
    subscriptions: <SubscriptionsTable subscriptions={details.subscriptions} />,
    downloads: <DownloadsTable downloads={details.downloads} />,
    licenses: <LicensesTable licenses={details.licenses} />,
    ai: <GenerationsTable generations={details.generations} credits={details.credits} />,
  };

  return (
    <Stack gap={vars.spacing[6]}>
      <TextLink to={routes.adminUsers}>{t.backToUsers}</TextLink>
      <SectionHeader as="h1"
        title={account.name}
        subtitle={account.email}
        autoDirection
        actions={
          <Stack direction="row" wrap gap={vars.spacing[2]} align="center">
            <Badge variant={accountStatusTone[account.status]}>{t.statuses[account.status]}</Badge>
            {actionsFor[account.status].map((next) => (
              <Button key={next} size="sm" variant={next === 'reactivate' ? 'primary' : 'danger'} onClick={() => setAction(next)}>
                {t[next]}
              </Button>
            ))}
          </Stack>
        }
      />
      {notice && (
        <Notice tone="success" onDismiss={() => setNotice(null)}>
          {notice}
        </Notice>
      )}
      {appealWaiting && (
        <Stack gap={vars.spacing[2]} align="flex-start">
          <Notice tone="warning">{t.appealWaiting}</Notice>
          <Button size="sm" variant="secondary" onClick={() => setReviewingAppeal(true)}>
            {t.reviewAppeal}
          </Button>
        </Stack>
      )}
      <Card title={t.overview}>
        <DetailList
          rows={[
            { label: text.admin.columns.type, value: t.kinds[account.kind] },
            { label: t.joined, value: formatDate(account.joinedAt, locale) },
            { label: text.admin.columns.plan, value: account.planName ?? text.admin.common.none },
            { label: t.sourceLabel, value: t.sources[account.source] },
            ...(account.statusReason ? [{ label: text.admin.columns.reason, value: t.statusReasons[account.statusReason] }] : []),
            ...(account.statusAt ? [{ label: t.since, value: formatDate(account.statusAt, locale) }] : []),
            ...(account.appeal?.rejectedAt
              ? [{ label: t.appealLabel, value: fillText(t.appealRejectedOn, { date: formatDate(account.appeal.rejectedAt, locale) }) }]
              : []),
          ]}
        />
        {account.source === 'site' && (
          <Text variant="bodySm" color={vars.colors.textMuted}>
            {t.siteNote}
          </Text>
        )}
      </Card>
      <Tabs
        label={t.detailTabsLabel}
        tabs={userDetailTabs.map((value) => ({ value, label: t.detailTabs[value] }))}
        value={tab}
        onChange={setTab}
      >
        {tables[tab]}
      </Tabs>
      {action && (
        <StatusModal
          user={account}
          action={action}
          onClose={() => setAction(null)}
          onSaved={(next) => saved(next, t.statusSaved[action])}
        />
      )}
      {reviewingAppeal && (
        <AppealModal
          user={account}
          onClose={() => setReviewingAppeal(false)}
          onDecided={(next, outcome) => saved(next, outcome === 'accepted' ? t.appealAccepted : t.appealRejected)}
        />
      )}
    </Stack>
  );
};

const User = () => {
  const { userId = '' } = useParams();
  const details = useAsync(() => fetchUser(userId), [userId]);

  return (
    <AsyncContent state={details}>
      {(data) => <UserView details={data} onChange={(account) => details.update({ ...data, account })} />}
    </AsyncContent>
  );
};

export const UserPage = () => (
  <RequirePermission permission="manageUsers">
    <User />
  </RequirePermission>
);
