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
}

//테이블리스트 타입
export interface TableOrder {
  tableId: number;
  tableName: string;
  orders: OrderItem[];
  isCompleted: boolean;
}
