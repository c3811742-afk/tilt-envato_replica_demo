import { PageHeader, RequirePermission, Stack, Tabs } from '@/features/admin/components';
import { searchTabs } from '@/features/admin/constants';
import { useTabParam } from '@/features/admin/hooks';
import { useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { NoClicksTab } from './NoClicksTab';
import { ReportsTab } from './ReportsTab';

const tabContent = { noClicks: NoClicksTab, reports: ReportsTab };

const SearchInsights = () => {
  const { text } = useLocale();
  const [tab, setTab] = useTabParam(searchTabs);
  const t = text.admin.search;
  const Content = tabContent[tab];

  return (
    <Stack gap={vars.spacing[6]}>
      <PageHeader title={t.title} description={t.description} />
      <Tabs
        label={t.tabsLabel}
        tabs={searchTabs.map((value) => ({ value, label: t.tabs[value] }))}
        value={tab}
        onChange={setTab}
      >
        <Content />
      </Tabs>
    </Stack>
  );
};

export const SearchInsightsPage = () => (
  <RequirePermission permission="viewSearchInsights">
    <SearchInsights />
  </RequirePermission>
);
