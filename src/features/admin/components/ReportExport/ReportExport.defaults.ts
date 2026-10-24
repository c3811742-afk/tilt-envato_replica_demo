import { reportKinds } from '@/features/admin/constants/business';
import type { ReportExportProps } from './ReportExport.types';

export const reportExportDefaults: Required<Pick<ReportExportProps, 'kinds'>> = {
  kinds: reportKinds,
};
