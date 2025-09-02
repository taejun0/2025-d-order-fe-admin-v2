// 주문 상태 정의
export type OrderStatus = "preparing" | "cooked" | "served";

// API 원본 데이터 타입 (기존과 동일)
export interface Order {
  id: number;
  menu_name: string;
  menu_price: number;
  menu_num: number;
  order_status: OrderStatus;
  created_at: string;
  table_num: number;
  menu_image?: string;
}

// UI에서 사용할 데이터 타입
export interface OrderItem {
  id: number;
  time: string;
  table: string;
  menu: string;
  quantity: number;
  status: OrderStatus;
  imageUrl?: string;
}

// API 응답 타입 (기존과 동일)
export interface OrderListResponse {
  status: string;
  message: string;
  code: number;
  data: {
    total_revenue: number;
    orders: Order[];
  };
}
