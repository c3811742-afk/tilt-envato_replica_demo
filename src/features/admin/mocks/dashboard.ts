// Last month's numbers, and this month's numbers the demo data can't work out by itself.
// Pending reviews and payouts are counted from the live demo data instead.
export const dashboardHistory = {
  previousSubscribers: 1360,
  previousMrr: 316400,
  churnRate: { value: 0.031, previous: 0.036 },
  downloads: { value: 12480, previous: 11020 },
  newItems: { value: 146, previous: 131 },
};

// Downloads per month by type, for the downloads report.
export const seedDownloadsByType = [
  { month: '2026-10', type: 'graphic', downloads: 5120 },
  { month: '2026-10', type: 'video', downloads: 2310 },
  { month: '2026-10', type: 'music', downloads: 1980 },
  { month: '2026-10', type: 'presentation', downloads: 1470 },
  { month: '2026-10', type: 'font', downloads: 1600 },
  { month: '2026-09', type: 'graphic', downloads: 4610 },
  { month: '2026-09', type: 'video', downloads: 2050 },
  { month: '2026-09', type: 'music', downloads: 1720 },
  { month: '2026-09', type: 'presentation', downloads: 1240 },
  { month: '2026-09', type: 'font', downloads: 1400 },
];
