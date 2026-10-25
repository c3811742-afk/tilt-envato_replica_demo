import { fetchDashboard } from '@/features/admin/api';
import { ReportExport, RequirePermission } from '@/features/admin/components';
import { useAdminSession } from '@/features/admin/hooks';
import type { DashboardStats, Metric } from '@/features/admin/types';
import { metricChange } from '@/features/admin/utils';
import { AsyncContent, Card, ErrorBoundary, SectionHeader, Stack, StatCard } from '@/shared/components';
import type { Text } from '@/shared/constants';
import { routes } from '@/shared/constants';
import { useAsync, useLocale } from '@/shared/hooks';
import type { Locale } from '@/shared/theme';
import { vars } from '@/shared/theme';
import { fillText, formatNumber, formatPercent, formatPrice } from '@/shared/utils';
import styles from './DashboardPage.module.css';

// "Up 4.8% from last month" / "Down 1.2% from last month" / "Same as last month", in words so it never relies on color.
const changeText = (metric: Metric, text: Text, locale: Locale) => {
  const change = metricChange(metric);
  const t = text.admin.dashboard;
  if (Math.abs(change) < 0.0005) return t.same;
  return fillText(change > 0 ? t.up : t.down, {
    percent: formatPercent(Math.abs(change), locale, 1),
  });
};

interface TilesProps {
  stats: DashboardStats;
}

const Tiles = ({ stats }: TilesProps) => {
  const { text, locale } = useLocale();
  const { can } = useAdminSession();
  const t = text.admin.dashboard;

  return (
    <div className={styles.tiles}>
      <StatCard
        label={t.subscribers}
        value={formatNumber(stats.activeSubscribers.value, locale)}
        detail={changeText(stats.activeSubscribers, text, locale)}
        to={can('managePlans') ? routes.adminPlans : undefined}
      />
      <StatCard
        label={t.mrr}
        value={formatPrice(stats.mrr.value, locale)}
        detail={changeText(stats.mrr, text, locale)}
        to={can('manageBilling') ? routes.adminBilling : undefined}
      />
      <StatCard
        label={t.churn}
        value={formatPercent(stats.churnRate.value, locale, 1)}
        detail={fillText(t.lastMonth, { value: formatPercent(stats.churnRate.previous, locale, 1) })}
      />
      <StatCard
        label={t.downloads}
        value={formatNumber(stats.downloads.value, locale)}
        detail={changeText(stats.downloads, text, locale)}
      />
      <StatCard
        label={t.newItems}
        value={formatNumber(stats.newItems.value, locale)}
        detail={changeText(stats.newItems, text, locale)}
      />
      <StatCard
        label={t.pendingReviews}
        value={formatNumber(stats.pendingReviews, locale)}
        detail={t.pendingReviewsDetail}
        to={can('review') ? routes.adminReview : undefined}
      />
      <StatCard
        label={t.pendingPayouts}
        value={formatNumber(stats.pendingPayouts.count, locale)}
        detail={fillText(t.pendingPayoutsDetail, { amount: formatPrice(stats.pendingPayouts.amount, locale) })}
        to={can('managePayouts') ? routes.adminPayouts : undefined}
      />
    </div>
  );
};

const Dashboard = () => {
  const { text } = useLocale();
  const { can } = useAdminSession();
  const stats = useAsync(fetchDashboard, []);
  const t = text.admin.dashboard;

  return (
    <Stack gap={vars.spacing[6]}>
      <SectionHeader as="h1" title={t.title} subtitle={t.description} />
      {/* The numbers can fail on their own; the report export below keeps working. */}
      <ErrorBoundary>
        <AsyncContent state={stats}>{(data) => <Tiles stats={data} />}</AsyncContent>
      </ErrorBoundary>
      {can('exportReports') && (
        <Card title={t.reportsTitle}>
          <ReportExport />
        </Card>
      )}
    </Stack>
  );
};

export const DashboardPage = () => (
  <RequirePermission permission="viewDashboard">
    <Dashboard />
  </RequirePermission>
);
