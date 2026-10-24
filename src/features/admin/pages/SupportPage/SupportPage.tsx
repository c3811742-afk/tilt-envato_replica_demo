import { PageHeader, RequirePermission, Stack, Tabs } from '@/features/admin/components';
import { supportTabs } from '@/features/admin/constants';
import { useTabParam } from '@/features/admin/hooks';
import { useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { ItemReportsTab } from './ItemReportsTab';
import { TicketsTab } from './TicketsTab';

const tabContent = { tickets: TicketsTab, itemReports: ItemReportsTab };

const Support = () => {
  const { text } = useLocale();
  const [tab, setTab] = useTabParam(supportTabs);
  const t = text.admin.support;
  const Content = tabContent[tab];

  return (
    <Stack gap={vars.spacing[6]}>
      <PageHeader title={t.title} description={t.description} />
      <Tabs
        label={t.tabsLabel}
        tabs={supportTabs.map((value) => ({ value, label: t.tabs[value] }))}
        value={tab}
        onChange={setTab}
      >
        <Content />
      </Tabs>
    </Stack>
  );
};

export const SupportPage = () => (
  <RequirePermission permission="handleSupport">
    <Support />
  </RequirePermission>
);
