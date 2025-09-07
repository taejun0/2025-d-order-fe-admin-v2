// services/dashboard.mock.ts
import { DashboardData } from './dashboard.types';

export const dashboardMock: DashboardData = {
  kpi: {
    totalOrders: 0,
    visitorsPerTable: 0,
    avgTableMinutes: 0,
    servedCount: 0,
    waitingCount: 0,
  },
  top3: [
    { id: 'm1', name: '--', price: 0, soldQty: 0, rank: 1, imageUrl: null },
    { id: 'm2', name: '--', price: 0, soldQty: 0, rank: 2, imageUrl: null },
    { id: 'm3', name: '--', price: 0, soldQty: 0, rank: 3, imageUrl: null },
  ],
  lowStock: [
    { id: 'l1', name: '--', price: 0, leftQty: 0, imageUrl: null },
    { id: 'l2', name: '--', price: 0, leftQty: 0, imageUrl: null },
    { id: 'l3', name: '--', price: 0, leftQty: 0, imageUrl: null },
  ],
  wait: { avgWaitAll: 0, avgWaitMenu: 0, waitingMenus: 0 },
};
