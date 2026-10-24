import { RequirePermission } from '@/features/admin/components';
import { planTabs } from '@/features/admin/constants';
import { useTabParam } from '@/features/admin/hooks';
import { useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { PlansTab } from './PlansTab';
import { PromoCodesTab } from './PromoCodesTab';
import { SectionHeader, Stack, Tabs } from '@/shared/components';

const tabContent = { plans: PlansTab, promoCodes: PromoCodesTab };

const Plans = () => {
  const { text } = useLocale();
  const [tab, setTab] = useTabParam(planTabs);
  const t = text.admin.plans;
  const Content = tabContent[tab];

  return (
    <Stack gap={vars.spacing[6]}>
      <SectionHeader as="h1" title={t.title} subtitle={t.pageDescription} />
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
