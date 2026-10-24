import { useSearchParams } from 'react-router';
import { RequirePermission } from '@/features/admin/components';
import { userTabs } from '@/features/admin/constants';
import { useTabParam } from '@/features/admin/hooks';
import { useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { AccountsTab } from './AccountsTab';
import { AppealsTab } from './AppealsTab';
import { DownloadAlertsTab } from './DownloadAlertsTab';
import { SectionHeader, Stack, Tabs } from '@/shared/components';

const Users = () => {
  const { text } = useLocale();
  const [tab, setTab] = useTabParam(userTabs);
  const [params] = useSearchParams();
  const query = params.get('q') ?? ''; // set by the search box in the top bar
  const t = text.admin.users;

  return (
    <Stack gap={vars.spacing[6]}>
      <SectionHeader as="h1" title={t.title} subtitle={t.description} />
      <Tabs
        label={t.tabsLabel}
        tabs={userTabs.map((value) => ({ value, label: t.tabs[value] }))}
        value={tab}
        onChange={setTab}
      >
        {/* key: a new search from the top bar starts the list again with that search. */}
        {tab === 'accounts' && <AccountsTab key={query} initialQuery={query} />}
        {tab === 'appeals' && <AppealsTab />}
        {tab === 'downloadAlerts' && <DownloadAlertsTab />}
      </Tabs>
    </Stack>
  );
};

export const UsersPage = () => (
  <RequirePermission permission="manageUsers">
    <Users />
  </RequirePermission>
);
