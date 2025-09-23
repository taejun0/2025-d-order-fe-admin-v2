import { DashboardData } from './dashboard.types';

export const dashboardMock: DashboardData = {
  kpi: {
    totalOrders: 0,
    recentOrders: 0,
    visitors: 0,
    seatType: '--',
    recentVisitors: 0,
    avgWaitTimeMin: 0,
    avgTableUsageMin: 0,
    turnoverRate: 0,
    servedCount: 0,
    waitingCount: 0,
  },
  top3: [
    { name: '--', image: '', price: 0, quantity: 0 },
    { name: '--', image: '', price: 0, quantity: 0 },
    { name: '--', image: '', price: 0, quantity: 0 },
  ],
  lowStock: [
    { name: '--', image: '', price: 0, remaining: 0 },
    { name: '--', image: '', price: 0, remaining: 0 },
    { name: '--', image: '', price: 0, remaining: 0 },
  ],
  wait: {
    avgWaitTimeMin: 0,
    // waitingCount: 0,
    // servedCount: 0,
  },
  money: { day1_revenue: 0, day2_revenue: 0, day3_revenue: 0 },
};
