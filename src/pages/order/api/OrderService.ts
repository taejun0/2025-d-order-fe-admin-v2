import { instance } from '../../../services/instance';
import { OrderListResponse, OrderStatus, Order } from '../types/orderTypes';
import { AxiosResponse } from 'axios';

// 실제 API 대신 더미 데이터를 사용하려면 true로 설정
const USE_DUMMY_DATA = true;

// 더미 데이터 (요구사항에 맞게 상태 추가)
// 수정 이유: as any 대신 명확한 타입을 지정하여 타입 안정성을 높였습니다.
const dummyOrderData: { orders: Order[] } = {
  orders: [
    { id: 1, created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(), table_num: 1, menu_name: '짜장면', menu_num: 2, order_status: 'preparing', menu_price: 8000, menu_image: 'https://via.placeholder.com/50' },
    { id: 2, created_at: new Date(Date.now() - 1000 * 60 * 4).toISOString(), table_num: 2, menu_name: '짬뽕', menu_num: 1, order_status: 'preparing', menu_price: 9000, menu_image: 'https://via.placeholder.com/50' },
    { id: 3, created_at: new Date(Date.now() - 1000 * 60 * 3).toISOString(), table_num: 1, menu_name: '탕수육', menu_num: 1, order_status: 'cooked', menu_price: 20000, menu_image: 'https://via.placeholder.com/50' },
    { id: 4, created_at: new Date(Date.now() - 1000 * 60 * 2).toISOString(), table_num: 3, menu_name: '군만두', menu_num: 1, order_status: 'preparing', menu_price: 6000, menu_image: 'https://via.placeholder.com/50' },
    { id: 5, created_at: new Date(Date.now() - 1000 * 60 * 1).toISOString(), table_num: 2, menu_name: '볶음밥', menu_num: 2, order_status: 'cooked', menu_price: 8500, menu_image: 'https://via.placeholder.com/50' },
  ]
};

const dummyApiResponse: OrderListResponse = {
  status: 'success',
  message: '성공',
  code: 200,
  data: {
    total_revenue: 125500,
    orders: dummyOrderData.orders
  }
};


class OrderService {
  static async getOrders(): Promise<OrderListResponse> {
    if (USE_DUMMY_DATA) {
      // 수정 이유: 더미 데이터가 OrderListResponse 타입을 완전히 만족하도록 수정했습니다.
      return Promise.resolve(dummyApiResponse);
    }
    const response: AxiosResponse<OrderListResponse> = await instance.get("/api/booths/orders/");
    return response.data;
  }

  static async updateOrderStatus(orderId: number, status: OrderStatus) {
    console.log(`Updating order ${orderId} to ${status}`);
    if (USE_DUMMY_DATA) {
        const target = dummyOrderData.orders.find(o => o.id === orderId);
        if (target) {
            target.order_status = status;
        }
        return Promise.resolve({ id: orderId, status });
    }
    return await instance.patch(`/api/orders/${orderId}/`, { order_status: status });
  }
}

export default OrderService;