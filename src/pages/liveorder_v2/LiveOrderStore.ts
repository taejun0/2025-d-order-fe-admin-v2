// src/pages/liveOrder_v2/liveOrderStore.ts

import { create } from "zustand";
import { OrderItem, OrderStatus } from "./types";
//api이전에 더미데이터로 일단 연결
import {
  MenuItem,
  DUMMY_MENU_LIST,
  DUMMY_LIVE_ORDERS,
} from "./dummy/DummyData";

// 앞으로 관리할 상태들의 타입을 정의합니다.
export type OrderViewMode = "kitchen" | "serving";

interface LiveOrderState {
  viewMode: OrderViewMode;
  setViewMode: (mode: OrderViewMode) => void;
  // (나중에 여기에 orders, changeOrderStatus 같은 다른 상태와 함수들을 추가할 겁니다)

  //메뉴목록 상태와타입,메뉴목록불러오는 함수타입추가
  menuItems: MenuItem[];
  fetchMenuItems: () => void;

  // --- 주문메뉴들어온거 부분 ---
  orders: OrderItem[];
  fetchOrders: () => void;
  changeOrderStatus: (orderId: number, newStatus: OrderStatus) => void;
}

// 2. 스토어를 생성합니다.
export const useLiveOrderStore = create<LiveOrderState>((set) => ({
  // 3. 기본 상태 값(Initial State)을 설정합니다.
  viewMode: "kitchen",

  // 4. 상태를 변경하는 함수(Action)를 정의합니다.
  setViewMode: (mode) => {
    console.log(`[Zustand] 뷰모드 :${mode}`);

    // 상태 변경
    set({ viewMode: mode });
  },

  //메뉴아이템의 초기값 빈배열
  menuItems: [],
  // fetchMenuItems 함수를 구현합니다.
  // 이 함수는 DUMMY_MENU_LIST를 상태에 저장하는 역할을 합니다.
  fetchMenuItems: () => {
    // 필터링을 위해 "전체" 메뉴를 맨 앞에 추가해줍니다.
    const allMenu: MenuItem = { id: 0, name: "전체" };
    const menuListWithAll = [allMenu, ...DUMMY_MENU_LIST];
    console.log("[Zustand] 메뉴 목록을 불러옵니다:", menuListWithAll);

    // set 함수를 통해 menuItems 상태를 업데이트합니다.
    set({ menuItems: menuListWithAll });
  },

  // --- 👇 주문목록,버튼상태관리 핵심 👇 ---

  // 3. 주문 목록 상태 추가
  orders: [],

  // 4. 초기 주문 데이터 로딩 함수 (더미 데이터 사용)
  fetchOrders: () => {
    console.log("[Zustand] 더미 주문 데이터를 불러옵니다.");
    // 실제 앱처럼 오래된 주문이 위로 오도록 정렬
    const sortedOrders = DUMMY_LIVE_ORDERS.sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    set({ orders: sortedOrders });
  },

  // 5. 주문 상태 변경 함수 (낙관적 업데이트 시뮬레이션)
  changeOrderStatus: (orderId, newStatus) => {
    console.log(
      `[Zustand] 주문 #${orderId} 상태를 ${newStatus}(으)로 변경합니다.`
    );

    // 실제 API 호출이 들어갈 자리
    // 지금은 set 함수를 통해 즉시 상태를 변경하여 낙관적 업데이트를 흉내 냅니다.
    set((state) => ({
      orders: state.orders.map((order) =>
        order.id === orderId
          ? { ...order, status: newStatus } // ID가 일치하는 주문의 상태만 변경
          : order
      ),
    }));
  },
}));
