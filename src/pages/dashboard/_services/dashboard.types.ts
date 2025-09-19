// 서버 응답(json)과 프론트 내부 타입 분리

// BE 원본 응답 (snake_case)
export type DashboardResponse = {
  status: 'success' | 'fail';
  data: {
    total_orders: number;
    recent_orders: number;
    visitors: number;
    recent_visitors: number;
    avg_wait_time: number;
    avg_table_usage: number;
    turnover_rate: number;
    served_count: number;
    waiting_count: number;
    top3_menus: Array<{
      menu_name: string;
      menu_image: string;
      price: number;
      total_quantity: number;
    }>;
    low_stock: Array<{
      menu_name: string;
      menu_image: string;
      price: number;
      remaining: number;
    }>;
  };
};

// FE 내부에서 사용할 camelCase 타입
export type DashboardData = {
  kpi: {
    totalOrders: number;
    recentOrders: number;
    visitors: number;
    recentVisitors: number;
    avgWaitTimeMin: number;
    avgTableUsageMin: number;
    turnoverRate: number;
    servedCount: number;
    waitingCount: number;
  };
  top3: Array<{ name: string; image: string; price: number; quantity: number }>;
  lowStock: Array<{
    name: string;
    image: string;
    price: number;
    remaining: number;
  }>;
  wait: {
    avgWaitTimeMin: number;
  };
};

export type KPI = {
  totalOrders: number;
  recentOrders?: number;
  visitors: number;
  recentVisitors?: number;
  avgTableUsageMin: number;
  turnoverRate?: number;
  servedCount: number;
  waitingCount: number;
};

export type LowStockItem = {
  name: string;
  imageUrl?: string;
  price: number;
  remaining: number;
};

export type TopMenuItem = {
  name: string;
  imageUrl?: string;
  price: number;
  quantity: number;
};

export type WaitStat = {
  avgWaitTimeMin: number;
  // waitingCount: number;
};
