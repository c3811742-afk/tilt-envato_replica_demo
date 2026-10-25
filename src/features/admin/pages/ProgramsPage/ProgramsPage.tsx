import { useState } from 'react';
import { fetchPrograms } from '@/features/admin/api';
import { RequirePermission } from '@/features/admin/components';
import { programStatusTone } from '@/features/admin/constants';
import type { Program } from '@/features/admin/types';
import { fromDateKey, programStatus, toDateKey, upsertById } from '@/features/admin/utils';
import { AsyncContent, Badge, Button, EmptyState, Icon, Notice, type RecordColumn, recordRows, SectionHeader, Stack, Table, Text } from '@/shared/components';
import { useAsync, useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { fillText, formatDate, formatNumber, isolate } from '@/shared/utils';
import { ProgramModal } from './ProgramModal';

const Programs = () => {
  const { text, locale } = useLocale();
  const programs = useAsync(fetchPrograms, []);
  const [editing, setEditing] = useState<Program | 'new' | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const t = text.admin.programs;
  const today = toDateKey();
  const day = (key: string) => formatDate(fromDateKey(key), locale);
  const current = programs.status === 'success' ? programs.data : [];

  const columns: RecordColumn<Program>[] = [
    {
      key: 'program',
      label: text.admin.columns.program,
      render: (program) => (
        <Stack gap={vars.spacing[1]}>
          <Text as="span" autoDirection>
            <strong>{program.name}</strong>
          </Text>
          <Text as="span" variant="bodySm" color={vars.colors.textMuted} autoDirection>
            {program.university}
          </Text>
          {program.prize && (
            <Text as="span" variant="bodySm" color={vars.colors.textMuted}>
              {fillText(t.prize, { prize: isolate(program.prize) })}
            </Text>
          )}
        </Stack>
      ),
    },
    { key: 'kind', label: text.admin.columns.type, render: (program) => t.kinds[program.kind] },
    {
      key: 'dates',
      label: text.admin.columns.dates,
      render: (program) => (
        <Stack gap={vars.spacing[1]}>
          <Text as="span">
            {fillText(text.admin.common.dateRange, { start: day(program.startDate), end: day(program.endDate) })}
          </Text>
          {program.resultsDate && (
            <Text as="span" variant="bodySm" color={vars.colors.textMuted}>
              {fillText(t.resultsOn, { date: day(program.resultsDate) })}
            </Text>
          )}
        </Stack>
      ),
    },
    {
      key: 'status',
      label: text.admin.columns.status,
      render: (program) => {
        const status = programStatus(program, today);
        return <Badge variant={programStatusTone[status]}>{t.statuses[status]}</Badge>;
      },
    },
    {
      key: 'participants',
      label: text.admin.columns.participants,
      render: (program) => formatNumber(program.participants, locale),
    },
    {
      key: 'actions',
      label: text.admin.columns.actions,
      align: 'end',
      render: (program) => (
        <Button size="sm" variant="outline" iconOnly tooltip={text.admin.common.edit} tooltipAlign="end" onClick={() => setEditing(program)}>
          <Icon name="pencil" size={vars.sizes.icon.sm} />
        </Button>
      ),
    },
  ];

  const addButton = <Button onClick={() => setEditing('new')}>{t.add}</Button>;

  return (
    <Stack gap={vars.spacing[6]}>
      <SectionHeader as="h1" title={t.title} subtitle={t.description} actions={current.length > 0 && addButton} />
      {notice && (
        <Notice tone="success" onDismiss={() => setNotice(null)}>
          {notice}
        </Notice>
      )}
      <AsyncContent
        state={programs}
        empty={<EmptyState title={t.emptyTitle} message={t.emptyMessage} action={addButton} />}
      >
        {(list) => <Table label={t.title} columns={columns} rows={recordRows(list, (program) => program.id, columns)} stackOnMobile />}
      </AsyncContent>
      {editing && (
        <ProgramModal
          program={editing === 'new' ? undefined : editing}
          onClose={() => setEditing(null)}
          onSaved={(saved) => {
            programs.update(upsertById(current, saved).sort((a, b) => b.startDate.localeCompare(a.startDate)));
            setEditing(null);
            setNotice(fillText(t.saved, { name: isolate(saved.name) }));
          }}
        />
      )}
    </Stack>
  );
};

export const ProgramsPage = () => (
  <RequirePermission permission="managePrograms">
    <Programs />
  </RequirePermission>
);
