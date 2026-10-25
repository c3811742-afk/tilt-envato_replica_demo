import { RequirePermission } from '@/features/admin/components';
import { searchTabs } from '@/features/admin/constants';
import { useLocale, useTabParam } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { NoClicksTab } from './NoClicksTab';
import { ReportsTab } from './ReportsTab';
import { SectionHeader, Stack, Tabs } from '@/shared/components';

const tabContent = { noClicks: NoClicksTab, reports: ReportsTab };

const SearchInsights = () => {
  const { text } = useLocale();
  const [tab, setTab] = useTabParam(searchTabs);
  const t = text.admin.search;
  const Content = tabContent[tab];

  return (
    <Stack gap={vars.spacing[6]}>
      <SectionHeader as="h1" title={t.title} subtitle={t.description} />
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
