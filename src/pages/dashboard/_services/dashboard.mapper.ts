// _services/dashboard.mapper.ts
import { DashboardData, DashboardResponse } from './dashboard.types';

const API_BASE = import.meta.env.VITE_API_URL?.replace(/\/$/, '') || '';

function withImageBase(url: string | null): string | null {
  if (!url) return null;
  if (url.startsWith('http')) return url; // 이미 절대경로면 그대로
  return `${API_BASE}${url}`;
}

/** INIT/REST 전체 응답 매핑 */
export function mapDashboardResponse(
  res: DashboardResponse | any
): DashboardData {
  const d = res && 'data' in res ? (res as any).data : res ?? {};

  return {
    kpi: {
      totalOrders: d.total_orders ?? 0,
      recentOrders: d.recent_orders ?? 0,
      visitors: d.visitors ?? 0,
      seatType: d.seat_type ?? 'PP',
      recentVisitors: d.recent_visitors ?? 0,
      avgWaitTimeMin: d.avg_wait_time ?? 0,
      avgTableUsageMin: d.avg_table_usage ?? 0,
      turnoverRate: d.turnover_rate ?? 0,
      servedCount: d.served_count ?? 0,
      waitingCount: d.waiting_count ?? 0,
    },
    top3: (d.top3_menus ?? []).map((m: any) => ({
      name: m?.menu__menu_name ?? '',
      imageUrl: withImageBase(m.menu__menu_image) ?? '',
      price: m?.menu__menu_price ?? 0,
      quantity: m?.total_quantity ?? 0,
    })),
    lowStock: (d.low_stock ?? []).map((s: any) => ({
      name: s?.menu_name ?? '',
      imageUrl: s?.menu_image ?? '',
      price: s?.menu_price ?? 0,
      remaining: s?.remaining ?? 0,
    })),
    wait: {
      avgWaitTimeMin: d.avg_wait_time ?? 0,
    },
  };
}

/** WS PATCH 매핑 */
export function mapDashboardPatch(res: any): Partial<DashboardData> {
  const d = res && 'data' in res ? (res as any).data : res ?? {};
  const patch: Partial<DashboardData> = {};

  const kpi: Partial<DashboardData['kpi']> = {};
  if ('total_orders' in d) kpi.totalOrders = d.total_orders;
  if ('recent_orders' in d) kpi.recentOrders = d.recent_orders;
  if ('visitors' in d) kpi.visitors = d.visitors;
  if ('recent_visitors' in d) kpi.recentVisitors = d.recent_visitors;
  if ('avg_wait_time' in d) {
    kpi.avgWaitTimeMin = d.avg_wait_time;
    patch.wait = { avgWaitTimeMin: d.avg_wait_time };
  }
  if ('avg_table_usage' in d) kpi.avgTableUsageMin = d.avg_table_usage;
  if ('turnover_rate' in d) kpi.turnoverRate = d.turnover_rate;
  if ('served_count' in d) kpi.servedCount = d.served_count;
  if ('waiting_count' in d) kpi.waitingCount = d.waiting_count;
  if (Object.keys(kpi).length) patch.kpi = kpi as DashboardData['kpi'];

  if ('top3_menus' in d) {
    patch.top3 = (d.top3_menus ?? []).map((m: any) => ({
      name: m?.menu__menu_name ?? '',
      imageUrl: m?.menu__menu_image ?? '',
      price: m?.menu__menu_price ?? 0,
      quantity: m?.total_quantity ?? 0,
    }));
  }

  if ('low_stock' in d) {
    patch.lowStock = (d.low_stock ?? []).map((s: any) => ({
      name: s?.menu_name ?? '',
      imageUrl: s?.menu_image ?? '',
      price: s?.menu_price ?? 0,
      remaining: s?.remaining ?? 0,
    }));
  }

  return patch;
}

/** 깊은 병합 */
export function mergeDashboard(
  prev: DashboardData | undefined,
  patch: Partial<DashboardData>
): DashboardData {
  if (!prev) {
    return {
      kpi: {
        totalOrders: 0,
        recentOrders: 0,
        visitors: 0,
        recentVisitors: 0,
        seatType: '',
        avgWaitTimeMin: 0,
        avgTableUsageMin: 0,
        turnoverRate: 0,
        servedCount: 0,
        waitingCount: 0,
        ...(patch.kpi ?? {}),
      },
      top3: patch.top3 ?? [],
      lowStock: patch.lowStock ?? [],
      wait: { avgWaitTimeMin: 0, ...(patch.wait ?? {}) },
    };
  }
  return {
    ...prev,
    kpi: { ...prev.kpi, ...patch.kpi },
    top3: 'top3' in patch ? patch.top3 ?? [] : prev.top3,
    lowStock: 'lowStock' in patch ? patch.lowStock ?? [] : prev.lowStock,
    wait: { ...prev.wait, ...patch.wait },
  };
}
