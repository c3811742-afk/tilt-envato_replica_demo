import { Link } from 'react-router';
import { adminAlertLinks } from '@/features/admin/constants';
import { useAdminSession } from '@/features/admin/hooks';
import type { AdminAlerts } from '@/features/admin/types';
import { Badge, Dropdown, Icon, Stack, Text } from '@/shared/components';
import { useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { formatNumber } from '@/shared/utils';
import styles from './AlertsMenu.module.css';

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
    <Dropdown
      label={t.label}
      trigger={
        <>
          <Icon name="bell" size={vars.sizes.icon.sm} />
          {total > 0 && <Badge variant="highlight">{formatNumber(total, locale)}</Badge>}
        </>
      }
    >
      <Stack gap={vars.spacing[3]}>
        <Text variant="label" color={vars.colors.textMuted}>
          {t.title}
        </Text>
        {waiting.length === 0 ? (
          <Text variant="bodySm">{alerts ? t.none : t.unavailable}</Text>
        ) : (
          <ul className={styles.list}>
            {waiting.map((link) => (
              <li key={link.key}>
                <Link to={link.to} className={styles.link}>
                  <span>{t.items[link.key]}</span>
                  <span className={styles.count}>{formatNumber(alerts?.[link.key] ?? 0, locale)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Stack>
    </Dropdown>
  );
};
