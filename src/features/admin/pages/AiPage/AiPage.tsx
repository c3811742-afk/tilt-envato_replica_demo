import { RequirePermission } from '@/features/admin/components';
import { aiTabs } from '@/features/admin/constants';
import { useLocale, useTabParam } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { CostsTab } from './CostsTab';
import { RulesTab } from './RulesTab';
import { ToolsTab } from './ToolsTab';
import { SectionHeader, Stack, Tabs } from '@/shared/components';

const tabContent = { tools: ToolsTab, costs: CostsTab, rules: RulesTab };

const Ai = () => {
  const { text } = useLocale();
  const [tab, setTab] = useTabParam(aiTabs);
  const t = text.admin.ai;
  const Content = tabContent[tab];

  return (
    <Stack gap={vars.spacing[6]}>
      <SectionHeader as="h1" title={t.title} subtitle={t.description} />
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
