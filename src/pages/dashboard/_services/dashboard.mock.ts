import { DashboardData } from './dashboard.types';

export const dashboardMock: DashboardData = {
  kpi: {
    totalOrders: 0,
    recentOrders: 0,
    visitors: 0,
    recentVisitors: 0,
    avgWaitTimeMin: 0,
    avgTableUsageMin: 0,
    turnoverRate: 0,
    servedCount: 0,
    waitingCount: 0,
  },
  top3: [
    { name: '--', image: '', quantity: 0 },
    { name: '--', image: '', quantity: 0 },
    { name: '--', image: '', quantity: 0 },
  ],
  lowStock: [
    { name: '--', image: '', remaining: 0 },
    { name: '--', image: '', remaining: 0 },
    { name: '--', image: '', remaining: 0 },
  ],
  wait: {
    avgWaitTimeMin: 0,
    // waitingCount: 0,
    // servedCount: 0,
  },
};
