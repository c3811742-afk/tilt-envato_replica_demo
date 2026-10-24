// A key number with last month's value, so the change can be shown next to it.
export interface Metric {
  value: number;
  previous: number;
}

export interface DashboardStats {
  activeSubscribers: Metric;
  mrr: Metric; // monthly recurring revenue, EGP
  churnRate: Metric; // share of subscribers who left this month, 0 to 1
  downloads: Metric; // last 30 days
  newItems: Metric; // published in the last 30 days
  pendingReviews: number;
  pendingPayouts: { count: number; amount: number };
}
