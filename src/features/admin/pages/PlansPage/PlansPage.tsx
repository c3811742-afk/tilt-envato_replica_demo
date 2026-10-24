import { PageHeader, RequirePermission, Stack, Tabs } from '@/features/admin/components';
import { planTabs } from '@/features/admin/constants';
import { useTabParam } from '@/features/admin/hooks';
import { useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { PlansTab } from './PlansTab';
import { PromoCodesTab } from './PromoCodesTab';

const tabContent = { plans: PlansTab, promoCodes: PromoCodesTab };

const Plans = () => {
  const { text } = useLocale();
  const [tab, setTab] = useTabParam(planTabs);
  const t = text.admin.plans;
  const Content = tabContent[tab];

  return (
    <Stack gap={vars.spacing[6]}>
      <PageHeader title={t.title} description={t.pageDescription} />
      <Tabs
        label={t.tabsLabel}
        tabs={planTabs.map((value) => ({ value, label: t.tabs[value] }))}
        value={tab}
        onChange={setTab}
      >
        <Content />
      </Tabs>
    </Stack>
  );
};

export const PlansPage = () => (
  <RequirePermission permission="managePlans">
    <Plans />
  </RequirePermission>
);
