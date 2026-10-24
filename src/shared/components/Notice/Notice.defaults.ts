import { vars } from '@/shared/theme';
import type { NoticeProps, NoticeTone } from './Notice.types';

export const noticeTones: Record<NoticeTone, { background: string; color: string }> = {
  info: { background: vars.colors.info, color: vars.colors.onInfo },
  success: { background: vars.colors.success, color: vars.colors.onSuccess },
  warning: { background: vars.colors.warning, color: vars.colors.onWarning },
  danger: { background: vars.colors.danger, color: vars.colors.onDanger },
};

export const noticeDefaults: Required<Pick<NoticeProps, 'tone'>> = {
  tone: 'info',
};
