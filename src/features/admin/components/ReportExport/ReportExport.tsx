import { useState } from 'react';
import { exportReport } from '@/features/admin/api';
import { useAdminAction, useAdminSession } from '@/features/admin/hooks';
import type { Report, ReportKind } from '@/features/admin/types';
import { downloadFile, fillText, fromDateKey, isOneOf, toCsv, toMonthKey } from '@/features/admin/utils';
import { Button, Select, Stack, TextField } from '@/shared/components';
import type { Text } from '@/shared/constants';
import { useLocale } from '@/shared/hooks';
import { formatDate, withDefaults } from '@/shared/utils';
import { FilterBar } from '../FilterBar';
import { Notice } from '../Notice';

import { reportExportDefaults } from './ReportExport.defaults';
import type { ReportExportProps } from './ReportExport.types';

const monthFormat: Intl.DateTimeFormatOptions = { month: 'long', year: 'numeric' };

// Codes in a report (an element type, a payment method, a payout status) written out in the admin's language.
const readable = (column: string, value: string | number, text: Text) => {
  const lists: Record<string, Record<string, string>> = {
    type: text.admin.elementTypes,
    method: text.admin.methods,
    status: text.admin.payoutStatuses,
  };
  return typeof value === 'string' ? (lists[column]?.[value] ?? value) : value;
};

const toFile = (report: Report, text: Text) =>
  toCsv(
    report.columns.map((column) => text.admin.reports.columns[column as keyof typeof text.admin.reports.columns]),
    report.rows.map((row) => row.map((value, index) => readable(report.columns[index], value, text))),
  );

// Pick a report and a month, then download it as a CSV file that opens in Excel or Google Sheets.
export const ReportExport = (props: ReportExportProps) => {
  const { kinds } = withDefaults(reportExportDefaults, props);
  const { text, locale } = useLocale();
  const { currentAdmin } = useAdminSession();
  const { run, pending, error } = useAdminAction();
  const [kind, setKind] = useState<ReportKind>(kinds[0]);
  const [month, setMonth] = useState(toMonthKey());
  const [notice, setNotice] = useState<string | null>(null);
  const t = text.admin.reports;

  const download = async () => {
    setNotice(null);
    const result = await run(() => exportReport(currentAdmin.id, kind, month));
    if (!result.ok) return;
    const values = { report: text.admin.reportKinds[kind], month: formatDate(fromDateKey(month), locale, monthFormat) };
    if (result.data.rows.length === 0) {
      setNotice(fillText(t.noData, values));
      return;
    }
    downloadFile(`tilt-${kind}-${month}.csv`, toFile(result.data, text));
    setNotice(fillText(t.downloaded, values));
  };

  return (
    <Stack>
      {notice && (
        <Notice tone="info" onDismiss={() => setNotice(null)}>
          {notice}
        </Notice>
      )}
      {error && <Notice tone="danger">{error}</Notice>}
      <FilterBar>
        <Select
          label={t.kindLabel}
          options={kinds.map((value) => ({ value, label: text.admin.reportKinds[value] }))}
          value={kind}
          onChange={(value) => isOneOf(kinds, value) && setKind(value)}
        />
        <TextField type="month" label={t.monthLabel} value={month} onChange={(value) => value && setMonth(value)} />
      </FilterBar>
      <Stack direction="row" wrap>
        <Button variant="secondary" disabled={pending} onClick={download}>
          {t.download}
        </Button>
      </Stack>
    </Stack>
  );
};
