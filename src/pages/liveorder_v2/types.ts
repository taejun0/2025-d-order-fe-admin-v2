// src/pages/liveOrder_v2/types.ts
export type OrderStatus = "PREPARING" | "COOKED" | "SERVED";

export interface OrderItem {
  id: number;
  menu_name: string;
  menu_num: number;
  table_num: number;
  status: OrderStatus;
  created_at: string;
  menu_image: string | null;
  isFadingOut?: boolean;
  servedAt?: number | null; // 추가: 서빙된 시간 (타임스탬프)
}

//테이블리스트 타입
export interface TableOrder {
  tableId: number;
  tableName: string;
  orders: OrderItem[];
  isCompleted: boolean;
}
