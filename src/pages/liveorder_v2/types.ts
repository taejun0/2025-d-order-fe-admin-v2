// src/pages/liveOrder_v2/types.ts

export type OrderStatus = "pending" | "cooked" | "served";

export interface OrderItem {
  id: number; // ordermenu_id
  order_id: number;
  menu_name: string;
  menu_num: number;
  table_num: number;
  status: OrderStatus;
  created_at: string;
  menu_image: string | null;
  isFadingOut?: boolean;
  servedAt?: number | null; // 서빙된 시간
  completedAt?: number | null; // 주문 완료 시간 (ORDER_COMPLETED에서 받은 served_at)

  from_set: boolean;
  set_id: number | null;
  set_name: string | null;
}

// API 명세서에 따른 새로운 타입 정의
export interface ApiOrderItem {
  ordermenu_id: number;
  order_id: number;
  menu_id: number;
  menu_name: string;
  menu_image: string | null;
  quantity: number;
  status: OrderStatus;
  created_at: string;
  table_num: number;
  from_set: boolean;
  set_id: number | null;
  set_name: string | null;
}

// ORDER_SNAPSHOT 이벤트 메시지 타입은 기존과 동일
export interface OrderSnapshotMessage {
  type: "ORDER_SNAPSHOT";
  data: {
    total_revenue: number;
    orders: ApiOrderItem[];
  };
}

// 새로운 ORDER_UPDATE 이벤트 메시지 타입
export interface OrderUpdateMessage {
  type: "ORDER_UPDATE";
  data: {
    total_revenue?: number;
    orders: ApiOrderItem[];
  };
}
export interface OrderCompletedMessage {
  type: "ORDER_COMPLETED";
  data: {
    order_id: number;
    table_num: number;
    served_at: string;
  };
}
export interface OrderCancelledMessage {
  type: "ORDER_CANCELLED";
  data: {
    order_id: number;
    table_num: number;
    cancelled_items: {
      order_menu_id: number;
      menu_name: string;
      quantity: number;
    }[];
  };
}

export type LiveOrderWebSocketMessage =
  | OrderSnapshotMessage
  | OrderUpdateMessage
  | OrderCompletedMessage
  | OrderCancelledMessage;

export interface TableOrder {
  tableId: number;
  tableName: string;
  orders: OrderItem[];
  isCompleted: boolean;
  completedAt?: number | null; // 주문 완료 시간
  isFadingOut?: boolean; // 페이드아웃 상태
}
// API 응답을 기존 OrderItem 타입으로 매핑하는 함수
export const mapApiOrdersToOrderItems = (
  apiOrders: ApiOrderItem[]
): OrderItem[] => {
  return apiOrders.map((apiOrder) => ({
    id: apiOrder.ordermenu_id, // 기존 id를 ordermenu_id로 매핑
    order_id: apiOrder.order_id,
    menu_name: apiOrder.menu_name,
    menu_num: apiOrder.quantity, // 기존 menu_num을 quantity로 매핑
    table_num: apiOrder.table_num,
    status: apiOrder.status,
    created_at: apiOrder.created_at,
    menu_image: apiOrder.menu_image,
    isFadingOut: false,
    servedAt: null,

    from_set: apiOrder.from_set,
    set_id: apiOrder.set_id,
    set_name: apiOrder.set_name,
  }));
};
