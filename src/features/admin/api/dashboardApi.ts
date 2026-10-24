import { dashboardHistory } from '@/features/admin/mocks';
import type { DashboardStats } from '@/features/admin/types';
import { readAccounts } from '@/shared/utils';
import { db, respond } from './mockServer';
import { allPlans } from './plansApi';

const dayMs = 24 * 60 * 60 * 1000;
const monthDays = 30;

const siteDownloads = () => {
  const since = Date.now() - monthDays * dayMs;
  return readAccounts().reduce((total, account) => total + account.downloads.filter((download) => new Date(download.requestedAt).getTime() >= since).length, 0);
};

// Key numbers. Subscribers, revenue, pending reviews and pending payouts come from the demo data,
// so they change as admins work; the rest are fixed demo numbers.
export const fetchDashboard = () =>
  respond((): DashboardStats => {
    const plans = allPlans();
    const subscribers = plans.reduce((total, plan) => total + plan.subscribers, 0);
    const mrr = plans.reduce((total, plan) => total + plan.subscribers * (plan.monthlyPrice ?? 0), 0);
    const pendingPayouts = db.payouts.filter((payout) => payout.status === 'pending');

    return {
      activeSubscribers: { value: subscribers, previous: dashboardHistory.previousSubscribers },
      mrr: { value: mrr, previous: dashboardHistory.previousMrr },
      churnRate: dashboardHistory.churnRate,
      // The demo's numbers plus downloads made on the site in this browser in the last 30 days.
      downloads: { ...dashboardHistory.downloads, value: dashboardHistory.downloads.value + siteDownloads() },
      newItems: dashboardHistory.newItems,
      pendingReviews: db.elements.filter((element) => element.status === 'pending').length,
      pendingPayouts: {
        count: pendingPayouts.length,
        amount: pendingPayouts.reduce((total, payout) => total + payout.amount, 0),
      },
    };
  });
