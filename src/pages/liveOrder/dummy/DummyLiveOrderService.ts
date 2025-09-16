// src/dummy/DummyLiveOrderService.ts

// UI에서 사용할 주문 항목 인터페이스 (LiveOrderService와 동일하게 유지)
export interface OrderItem {
  id: number;
  time: string;
  table: string;
  menu: string;
  quantity: number;
  isServed: boolean;
  imageUrl?: string;
}

// API 응답 인터페이스 (LiveOrderService와 동일하게 유지)
export interface Order {
  id: number;
  menu_name: string;
  menu_price: number;
  menu_num: number;
  order_status: string;
  created_at: string;
  table_num: number;
  menu_image?: string;
}

export interface OrderListResponse {
  status: string;
  message: string;
  code: number;
  data: {
    total_revenue: number;
    orders: Order[];
  };
}

export interface OrderUpdateResponse {
  status: string;
  message: string;
  code: number;
  data: {
    id: number;
    cart_id: number;
    menu_id: number;
    menu_name: string;
    menu_price: number;
    menu_num: number;
    order_status: string;
    created_at: string;
  };
}

// =======================================================
// 더미 데이터 정의
// =======================================================
import pizza from '@assets/images/Pizza.svg';
// 임시 주문 데이터 저장소 (메모리에서 관리)
let dummyOrders: Order[] = [
  {
    id: 1,
    menu_name: '아이스 아메리카노',
    menu_price: 4500,
    menu_num: 2,
    order_status: 'order_received',
    created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5분 전
    table_num: 1,
    menu_image: `${pizza}`,
  },
  {
    id: 2,
    menu_name: '치즈 케이크',
    menu_price: 6000,
    menu_num: 1,
    order_status: 'order_received',
    created_at: new Date(Date.now() - 4 * 60 * 1000).toISOString(), // 4분 전
    table_num: 1,
    menu_image: `${pizza}`,
  },
  {
    id: 3,
    menu_name: '카페 라떼',
    menu_price: 5000,
    menu_num: 1,
    order_status: 'order_received',
    created_at: new Date(Date.now() - 3 * 60 * 1000).toISOString(), // 3분 전
    table_num: 2,
    menu_image: `${pizza}`,
  },
  {
    id: 4,
    menu_name: '샌드위치',
    menu_price: 7500,
    menu_num: 1,
    order_status: 'order_received',
    created_at: new Date(Date.now() - 2 * 60 * 1000).toISOString(), // 2분 전
    table_num: 3,
    menu_image: `${pizza}`,
  },
  {
    id: 5,
    menu_name: '초코 머핀',
    menu_price: 3500,
    menu_num: 2,
    order_status: 'order_received',
    created_at: new Date(Date.now() - 1 * 60 * 1000).toISOString(), // 1분 전
    table_num: 2,
    menu_image: `${pizza}`,
  },
  {
    id: 6,
    menu_name: '과일 주스',
    menu_price: 6000,
    menu_num: 1,
    order_status: 'served_complete', // 이미 서빙 완료된 주문
    created_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10분 전
    table_num: 4,
    menu_image: `${pizza}`,
  },
];

// =======================================================
// DummyLiveOrderService (더미 데이터 사용 버전)
// =======================================================

class DummyLiveOrderService {
  // 주문 목록 및 매출 정보 조회
  static async getOrders(): Promise<OrderListResponse> {
    // 네트워크 지연 시뮬레이션
    return new Promise((resolve) => {
      setTimeout(() => {
        const totalRevenue = dummyOrders.reduce(
          (sum, order) => sum + order.menu_price * order.menu_num,
          0
        );

        // API 응답 형식에 맞춰 데이터 반환
        resolve({
          status: 'success',
          message: '주문 목록을 성공적으로 가져왔습니다.',
          code: 200,
          data: {
            total_revenue: totalRevenue,
            // 주문 시각을 기준으로 최신순으로 정렬 (필요하다면)
            orders: [...dummyOrders].sort(
              (a, b) =>
                new Date(b.created_at).getTime() -
                new Date(a.created_at).getTime()
            ),
          },
        });
      }, 500); // 0.5초 지연
    });
  }

  // 주문 상태 업데이트 (서빙 완료로 변경)
  static async updateOrderStatus(
    orderId: number
  ): Promise<OrderUpdateResponse> {
    // 네트워크 지연 시뮬레이션
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const orderIndex = dummyOrders.findIndex(
          (order) => order.id === orderId
        );

        if (orderIndex === -1) {
          reject(new Error('Order not found')); // 주문을 찾을 수 없는 경우 에러 반환
          return;
        }

        const updatedOrder = {
          ...dummyOrders[orderIndex],
          order_status: 'served_complete',
        };
        dummyOrders[orderIndex] = updatedOrder; // 더미 데이터 업데이트

        resolve({
          status: 'success',
          message: `주문 ${orderId}의 상태가 서빙 완료로 업데이트되었습니다.`,
          code: 200,
          data: {
            id: updatedOrder.id,
            cart_id: 123, // 더미 값
            menu_id: 456, // 더미 값
            menu_name: updatedOrder.menu_name,
            menu_price: updatedOrder.menu_price,
            menu_num: updatedOrder.menu_num,
            order_status: updatedOrder.order_status,
            created_at: updatedOrder.created_at,
          },
        });
      }, 300); // 0.3초 지연
    });
  }
}

export default DummyLiveOrderService;
