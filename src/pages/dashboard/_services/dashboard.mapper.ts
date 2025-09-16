import { DashboardData, DashboardResponse } from './dashboard.types';

export function mapDashboardResponse(res: DashboardResponse): DashboardData {
  const d = res?.data ?? ({} as any);

  return {
    kpi: {
      totalOrders: d.total_orders ?? 0,
      recentOrders: d.recent_orders ?? 0,
      visitors: d.visitors ?? 0,
      recentVisitors: d.recent_visitors ?? 0,
      avgWaitTimeMin: d.avg_wait_time ?? 0,
      avgTableUsageMin: d.avg_table_usage ?? 0,
      turnoverRate: d.turnover_rate ?? 0,
      servedCount: d.served_count ?? 0,
      waitingCount: d.waiting_count ?? 0,
    },
    top3: (d.top3_menus ?? []).map((m: any) => ({
      name: m?.menu__menu_name ?? '',
      image: m?.menu_image ?? '',
      price: m?.menu__menu_price ?? 0,
      quantity: m?.total_quantity ?? 0,
    })),
    lowStock: (d.low_stock ?? []).map((s: any) => ({
      name: s?.menu_name ?? '',
      image: s?.menu_image ?? '',
      price: s?.menu_price ?? '',
      remaining: s?.remaining ?? 0,
    })),
    wait: {
      avgWaitTimeMin: d.avg_wait_time ?? 0,
    },
  };
}
