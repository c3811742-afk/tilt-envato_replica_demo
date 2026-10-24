import { PageHeader, Panel, ReportExport, RequirePermission, Stack, Tabs } from '@/features/admin/components';
import { payoutReportKinds, payoutTabs } from '@/features/admin/constants';
import { useTabParam } from '@/features/admin/hooks';
import { useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { RequestsTab } from './RequestsTab';
import { RulesTab } from './RulesTab';

const ReportsTab = () => {
  const { text } = useLocale();
  return (
    <Panel title={text.admin.payouts.reportsTitle}>
      <ReportExport kinds={payoutReportKinds} />
    </Panel>
  );
};

const tabContent = { requests: RequestsTab, rules: RulesTab, reports: ReportsTab };

const Payouts = () => {
  const { text } = useLocale();
  const [tab, setTab] = useTabParam(payoutTabs);
  const t = text.admin.payouts;
  const Content = tabContent[tab];

  return (
    <Stack gap={vars.spacing[6]}>
      <PageHeader title={t.title} description={t.description} />
      <Tabs
        label={t.tabsLabel}
        tabs={payoutTabs.map((value) => ({ value, label: t.tabs[value] }))}
        value={tab}
        onChange={setTab}
      >
        <Content />
      </Tabs>
    </Stack>
  );
};

export const PayoutsPage = () => (
  <RequirePermission permission="managePayouts">
    <Payouts />
  </RequirePermission>
);
