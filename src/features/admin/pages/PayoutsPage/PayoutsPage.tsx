import { ReportExport, RequirePermission } from '@/features/admin/components';
import { payoutReportKinds, payoutTabs } from '@/features/admin/constants';
import { useTabParam } from '@/features/admin/hooks';
import { useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { RequestsTab } from './RequestsTab';
import { RulesTab } from './RulesTab';
import { Card, SectionHeader, Stack, Tabs } from '@/shared/components';

const ReportsTab = () => {
  const { text } = useLocale();
  return (
    <Card title={text.admin.payouts.reportsTitle}>
      <ReportExport kinds={payoutReportKinds} />
    </Card>
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
      <SectionHeader as="h1" title={t.title} subtitle={t.description} />
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
