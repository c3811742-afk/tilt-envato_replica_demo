import { RequirePermission } from '@/features/admin/components';
import { billingTabs } from '@/features/admin/constants';
import { useLocale, useTabParam } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { FailedPaymentsTab } from './FailedPaymentsTab';
import { SubscriptionsTab } from './SubscriptionsTab';
import { TransactionsTab } from './TransactionsTab';
import { SectionHeader, Stack, Tabs } from '@/shared/components';

const tabContent = {
  transactions: TransactionsTab,
  failedPayments: FailedPaymentsTab,
  subscriptions: SubscriptionsTab,
};

const Billing = () => {
  const { text } = useLocale();
  const [tab, setTab] = useTabParam(billingTabs);
  const t = text.admin.billing;
  const Content = tabContent[tab];

  return (
    <Stack gap={vars.spacing[6]}>
      <SectionHeader as="h1" title={t.title} subtitle={t.description} />
      <Tabs
        label={t.tabsLabel}
        tabs={billingTabs.map((value) => ({ value, label: t.tabs[value] }))}
        value={tab}
        onChange={setTab}
      >
        <Content />
      </Tabs>
    </Stack>
  );
};

export const BillingPage = () => (
  <RequirePermission permission="manageBilling">
    <Billing />
  </RequirePermission>
);
