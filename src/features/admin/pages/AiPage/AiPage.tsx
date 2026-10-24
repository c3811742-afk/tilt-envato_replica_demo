import { PageHeader, RequirePermission, Stack, Tabs } from '@/features/admin/components';
import { aiTabs } from '@/features/admin/constants';
import { useTabParam } from '@/features/admin/hooks';
import { useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { CostsTab } from './CostsTab';
import { RulesTab } from './RulesTab';
import { ToolsTab } from './ToolsTab';

const tabContent = { tools: ToolsTab, costs: CostsTab, rules: RulesTab };

const Ai = () => {
  const { text } = useLocale();
  const [tab, setTab] = useTabParam(aiTabs);
  const t = text.admin.ai;
  const Content = tabContent[tab];

  return (
    <Stack gap={vars.spacing[6]}>
      <PageHeader title={t.title} description={t.description} />
      <Tabs
        label={t.tabsLabel}
        tabs={aiTabs.map((value) => ({ value, label: t.tabs[value] }))}
        value={tab}
        onChange={setTab}
      >
        <Content />
      </Tabs>
    </Stack>
  );
};

export const AiPage = () => (
  <RequirePermission permission="manageAi">
    <Ai />
  </RequirePermission>
);
