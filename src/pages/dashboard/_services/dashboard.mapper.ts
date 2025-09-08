import { DashboardData } from './dashboard.types';

export function mapDashboardResponse(raw: any): DashboardData {
  if (!raw) {
    // API 없을 때 기본 목 데이터 반환
    return {
      kpi: {
        totalOrders: 0,
        visitorsPerTable: 0,
        avgTableMinutes: 0,
        servedCount: 0,
        waitingCount: 0,
      },
      top3: [
        {
          id: 'mock1',
          name: '--',
          price: 0,
          soldQty: 0,
          rank: 1,
          imageUrl: null,
        },
        {
          id: 'mock2',
          name: '--',
          price: 0,
          soldQty: 0,
          rank: 2,
          imageUrl: null,
        },
        {
          id: 'mock3',
          name: '--',
          price: 0,
          soldQty: 0,
          rank: 3,
          imageUrl: null,
        },
      ],
      lowStock: [
        { id: 'mockL1', name: '--', price: 0, leftQty: 0, imageUrl: null },
        { id: 'mockL2', name: '--', price: 0, leftQty: 0, imageUrl: null },
        { id: 'mockL3', name: '--', price: 0, leftQty: 0, imageUrl: null },
      ],
      wait: {
        avgWaitAll: 0,
        avgWaitMenu: 0,
        waitingMenus: 0,
      },
    };
  }

  // 정상 변환 로직
  return {
    kpi: {
      totalOrders: raw.kpi?.total_orders ?? 0,
      visitorsPerTable: raw.kpi?.visitors_per_table ?? 0,
      avgTableMinutes: raw.kpi?.avg_table_minutes ?? 0,
      servedCount: raw.kpi?.served_count ?? 0,
      waitingCount: raw.kpi?.waiting_count ?? 0,
    },
    top3: (raw.top3 ?? []).map((x: any, i: number) => ({
      id: x.id ?? i,
      name: x.name ?? '--',
      price: x.price ?? 0,
      soldQty: x.sold_qty ?? 0,
      imageUrl: x.image_url ?? null,
      rank: (i + 1) as 1 | 2 | 3,
    })),
    lowStock: (raw.low_stock ?? []).map((x: any, i: number) => ({
      id: x.id ?? i,
      name: x.name ?? '--',
      price: x.price ?? 0,
      leftQty: x.left_qty ?? 0,
      imageUrl: x.image_url ?? null,
    })),
    wait: {
      avgWaitAll: raw.wait?.avg_wait_all ?? 0,
      avgWaitMenu: raw.wait?.avg_wait_menu ?? 0,
      waitingMenus: raw.wait?.waiting_menus ?? 0,
    },
  };
}
