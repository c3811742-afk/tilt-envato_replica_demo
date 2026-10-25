import { adminAlertLinks } from '@/features/admin/constants';
import { useAdminSession } from '@/features/admin/hooks';
import type { AdminAlerts } from '@/features/admin/types';
import { Badge, Icon, Menu } from '@/shared/components';
import { useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { formatNumber } from '@/shared/utils';

interface AlertsMenuProps {
  alerts: AdminAlerts | null;
}

// The bell: what is waiting for this admin (only what their role can act on), each a link to where it's handled.
export const AlertsMenu = ({ alerts }: AlertsMenuProps) => {
  const { text, locale } = useLocale();
  const { can } = useAdminSession();
  const t = text.admin.alerts;
  const waiting = adminAlertLinks.filter((link) => can(link.permission) && alerts && alerts[link.key] > 0);
  const total = waiting.reduce((sum, link) => sum + (alerts?.[link.key] ?? 0), 0);

  return (
    <Menu
      label={t.label}
      trigger={
        <>
          <Icon name="bell" size={vars.sizes.icon.sm} />
          {total > 0 && <Badge variant="highlight">{formatNumber(total, locale)}</Badge>}
        </>
      }
      title={t.title}
      empty={alerts ? t.none : t.unavailable}
      items={waiting.map((link) => ({
        key: link.key,
        label: t.items[link.key],
        to: link.to,
        count: formatNumber(alerts?.[link.key] ?? 0, locale),
      }))}
    />
  );
};
