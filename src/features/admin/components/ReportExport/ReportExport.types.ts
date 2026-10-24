import type { ReportKind } from '@/features/admin/types';

export interface ReportExportProps {
  kinds?: readonly ReportKind[]; // the reports to choose from
}
