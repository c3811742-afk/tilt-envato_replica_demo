import { dashboardHistory } from '@/features/admin/mocks';
import type { DashboardStats } from '@/features/admin/types';
import { db, respond } from './mockServer';

// Key numbers. Subscribers, revenue, pending reviews and pending payouts come from the demo data,
// so they change as admins work; the rest are fixed demo numbers.
export const fetchDashboard = () =>
  respond((): DashboardStats => {
    const subscribers = db.plans.reduce((total, plan) => total + plan.subscribers, 0);
    const mrr = db.plans.reduce((total, plan) => total + plan.subscribers * plan.monthlyPrice, 0);
    const pendingPayouts = db.payouts.filter((payout) => payout.status === 'pending');

    return {
      activeSubscribers: { value: subscribers, previous: dashboardHistory.previousSubscribers },
      mrr: { value: mrr, previous: dashboardHistory.previousMrr },
      churnRate: dashboardHistory.churnRate,
      downloads: dashboardHistory.downloads,
      newItems: dashboardHistory.newItems,
      pendingReviews: db.elements.filter((element) => element.status === 'pending').length,
      pendingPayouts: {
        count: pendingPayouts.length,
        amount: pendingPayouts.reduce((total, payout) => total + payout.amount, 0),
      },
    };
  });
