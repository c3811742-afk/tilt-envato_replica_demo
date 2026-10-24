import { useState } from 'react';
import { fetchAiTools, saveAiTools } from '@/features/admin/api';
import { Checkbox, DataTable, Notice, Stack, type DataTableColumn } from '@/features/admin/components';
import { useAdminAction, useAdminSession } from '@/features/admin/hooks';
import type { AiTool, AiToolKey, LocalizedText } from '@/features/admin/types';
import { fillText, localized, toggleItem } from '@/features/admin/utils';
import { AsyncContent, Button, Text } from '@/shared/components';
import { useAsync, useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';

interface ToolsFormProps {
  initialTools: AiTool[];
  plans: { id: string; name: LocalizedText; active: boolean }[];
}

// One row per tool: switch it on or off for everyone, and pick the plans that include it.
const ToolsForm = ({ initialTools, plans }: ToolsFormProps) => {
  const { text, locale } = useLocale();
  const { currentAdmin } = useAdminSession();
  const { run, pending, error } = useAdminAction();
  const [tools, setTools] = useState(initialTools);
  const [notice, setNotice] = useState<string | null>(null);
  const t = text.admin.ai;

  const change = (key: AiToolKey, update: (tool: AiTool) => AiTool) =>
    setTools((current) => current.map((tool) => (tool.key === key ? update(tool) : tool)));

  const save = async () => {
    setNotice(null);
    const result = await run(() => saveAiTools(currentAdmin.id, tools));
    if (!result.ok) return;
    setTools(result.data);
    setNotice(t.toolsSaved);
  };

  const columns: DataTableColumn<AiTool>[] = [
    {
      key: 'tool',
      header: text.admin.columns.tool,
      render: (tool) => (
        <Stack gap={vars.spacing[1]}>
          <Text as="span">{t.tools[tool.key]}</Text>
          <Text as="span" variant="bodySm" color={vars.colors.textMuted}>
            {fillText(t.model, { model: tool.model })}
          </Text>
        </Stack>
      ),
    },
    {
      key: 'enabled',
      header: t.onColumn,
      render: (tool) => (
        <Checkbox
          hideLabel
          label={fillText(t.toolOn, { tool: t.tools[tool.key] })}
          checked={tool.enabled}
          onChange={(enabled) => change(tool.key, (current) => ({ ...current, enabled }))}
        />
      ),
    },
    ...plans.map(
      (plan): DataTableColumn<AiTool> => ({
        key: plan.id,
        header: localized(plan.name, locale),
        render: (tool) => (
          <Checkbox
            hideLabel
            label={fillText(t.toolInPlan, { tool: t.tools[tool.key], plan: localized(plan.name, locale) })}
            checked={tool.planIds.includes(plan.id)}
            disabled={!tool.enabled}
            onChange={() => change(tool.key, (current) => ({ ...current, planIds: toggleItem(current.planIds, plan.id) }))}
          />
        ),
      }),
    ),
  ];

  return (
    <Stack>
      {notice && (
        <Notice tone="success" onDismiss={() => setNotice(null)}>
          {notice}
        </Notice>
      )}
      {error && <Notice tone="danger">{error}</Notice>}
      <DataTable label={t.tabs.tools} columns={columns} rows={tools} getRowKey={(tool) => tool.key} />
      <Stack direction="row">
        <Button disabled={pending} onClick={save}>
          {text.admin.common.save}
        </Button>
      </Stack>
    </Stack>
  );
};

export const ToolsTab = () => {
  const { text } = useLocale();
  const data = useAsync(fetchAiTools, []);

  return (
    <Stack>
      <Text color={vars.colors.textMuted}>{text.admin.ai.toolsDescription}</Text>
      <AsyncContent state={data}>{({ tools, plans }) => <ToolsForm initialTools={tools} plans={plans} />}</AsyncContent>
    </Stack>
  );
};
