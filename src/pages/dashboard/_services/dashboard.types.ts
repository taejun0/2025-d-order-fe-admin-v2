export type KPI = {
  totalOrders: number;
  visitorsPerTable: number;
  avgTableMinutes: number;
  servedCount: number;
  waitingCount: number;
};

export type TopMenuItem = {
  id: string | number;
  name: string;
  price: number; // 원 단위
  soldQty: number;
  imageUrl?: string | null;
  rank: 1 | 2 | 3;
};

export type LowStockItem = {
  id: string | number;
  name: string;
  price: number; // 원 단위
  leftQty: number;
  imageUrl?: string | null;
};

export type WaitStat = {
  avgWaitAll: number; // 분
  avgWaitMenu: number; // 분
  waitingMenus: number; // 개
};

export type DashboardData = {
  kpi: KPI;
  top3: TopMenuItem[];
  lowStock: LowStockItem[];
  wait: WaitStat;
};
