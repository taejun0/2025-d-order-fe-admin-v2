// src/pages/liveorder_v2/LiveOrderStore.ts

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { OrderItem, OrderStatus } from "./types";

// 기존 타입 복구 및 확장
export type OrderViewMode = "kitchen" | "serving";
const ANIMATION_DURATION = 1000; // 1초

// async/await를 사용하기 위한 delay 헬퍼 함수
const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

interface LiveOrderState {
  orders: OrderItem[];
  menuList: string[];
  viewMode: OrderViewMode; // 뷰 모드 상태 추가
  fadingOutTables: Set<number>;
  setOrders: (orders: OrderItem[]) => void;
  setMenuList: (menuNames: string[]) => void;
  setViewMode: (mode: OrderViewMode) => void; // 뷰 모드 변경 액션 추가
  updateOrderStatusWithAnimation: (
    orderId: number,
    newStatus: OrderStatus
  ) => void;
  addNewOrders: (newOrders: OrderItem[]) => void;
}

export const useLiveOrderStore = create<LiveOrderState>()(
  devtools((set, get) => ({
    orders: [],
    menuList: [],
    viewMode: "kitchen", // 기본 뷰 모드 설정
    fadingOutTables: new Set(),

    setOrders: (orders) => set({ orders }),

    setMenuList: (menuNames) => set({ menuList: menuNames }),

    setViewMode: (mode) => set({ viewMode: mode }),

    updateOrderStatusWithAnimation: async (orderId, newStatus) => {
      const targetOrder = get().orders.find((o) => o.id === orderId);
      if (!targetOrder) return;

      // 상태값을 소문자로 통일
      if (newStatus === "served") {
        // 1. MenuList 아이템 페이드아웃 시작
        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === orderId ? { ...order, isFadingOut: true } : order
          ),
        }));

        await delay(ANIMATION_DURATION);

        // 2. 상태를 'served'로 변경
        const ordersAfterItemServed = get().orders.map((order) =>
          order.id === orderId
            ? {
                ...order,
                status: "served" as OrderStatus,
                isFadingOut: false,
                servedAt: Date.now(),
              }
            : order
        );
        set({ orders: ordersAfterItemServed });

        const tableNum = targetOrder.table_num;
        const tableOrders = get().orders.filter(
          (o) => o.table_num === tableNum
        );
        const isTableFullyServed = tableOrders.every(
          (o) => o.status === "served"
        );

        // 3. 만약 테이블이 모두 완료되었다면, 'fadingOutTables' 상태를 업데이트
        if (isTableFullyServed) {
          set((state) => ({
            fadingOutTables: new Set(state.fadingOutTables).add(tableNum),
          }));

          await delay(ANIMATION_DURATION);

          set((state) => {
            const newSet = new Set(state.fadingOutTables);
            newSet.delete(tableNum);
            return { fadingOutTables: newSet };
          });
        }
      }
      // "cooked"로 상태 되돌리기 시
      else if (newStatus === "cooked" && targetOrder.status === "served") {
        const tableNum = targetOrder.table_num;
        set({
          orders: get().orders.map((order) => {
            if (order.id === orderId) {
              return {
                ...order,
                status: "cooked",
                isFadingOut: false,
                servedAt: null,
              };
            }
            if (order.table_num === tableNum) {
              return { ...order, isFadingOut: false };
            }
            return order;
          }),
        });
      }
      // 그 외의 모든 상태 변경
      else {
        set({
          orders: get().orders.map((o) =>
            o.id === orderId ? { ...o, status: newStatus } : o
          ),
        });
      }
    },

    addNewOrders: (newOrders) =>
      set((state) => {
        const existingOrderIds = new Set(state.orders.map((order) => order.id));
        const uniqueNewOrders = newOrders.filter(
          (order) => !existingOrderIds.has(order.id)
        );
        return { orders: [...state.orders, ...uniqueNewOrders] };
      }),
  }))
);
// import { create } from "zustand";
// import { OrderItem, OrderStatus } from "./types";
// import {
//   MenuItem,
//   DUMMY_MENU_LIST,
//   DUMMY_LIVE_ORDERS,
// } from "./dummy/DummyData";

// export type OrderViewMode = "kitchen" | "serving";
// const ANIMATION_DURATION = 1000; // 1초

// // async/await를 사용하기 위한 delay 헬퍼 함수
// const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

// interface LiveOrderState {
//   viewMode: OrderViewMode;
//   setViewMode: (mode: OrderViewMode) => void;
//   menuItems: MenuItem[];
//   fetchMenuItems: () => void;
//   orders: OrderItem[];
//   fadingOutTables: Set<number>; // 👈 테이블 페이드아웃 상태 추가
//   fetchOrders: () => void;
//   updateOrderStatusWithAnimation: (
//     orderId: number,
//     newStatus: OrderStatus
//   ) => void;
// }

// export const useLiveOrderStore = create<LiveOrderState>((set, get) => ({
//   viewMode: "kitchen",
//   setViewMode: (mode) => set({ viewMode: mode }),
//   menuItems: [],
//   fetchMenuItems: () => {
//     const allMenu: MenuItem = { id: 0, name: "전체" };
//     const menuListWithAll = [allMenu, ...DUMMY_MENU_LIST];
//     set({ menuItems: menuListWithAll });
//   },
//   orders: [],
//   fadingOutTables: new Set(), // 👈 상태 초기화
//   fetchOrders: () => {
//     const sortedOrders = [...DUMMY_LIVE_ORDERS].sort(
//       (a, b) =>
//         new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
//     );
//     set({ orders: sortedOrders });
//   },
//   updateOrderStatusWithAnimation: async (orderId, newStatus) => {
//     const targetOrder = get().orders.find((o) => o.id === orderId);
//     if (!targetOrder) return;

//     if (newStatus === "SERVED") {
//       // 1. MenuList 아이템 페이드아웃 시작
//       set((state) => ({
//         orders: state.orders.map((order) =>
//           order.id === orderId ? { ...order, isFadingOut: true } : order
//         ),
//       }));

//       await delay(ANIMATION_DURATION);

//       // 2. 상태를 'SERVED'로 변경 (이때는 isFadingOut을 건드리지 않음)
//       const ordersAfterItemServed = get().orders.map((order) =>
//         order.id === orderId
//           ? {
//               ...order,
//               status: "SERVED" as OrderStatus,
//               isFadingOut: false,
//               servedAt: Date.now(),
//             }
//           : order
//       );
//       set({ orders: ordersAfterItemServed });

//       const tableNum = targetOrder.table_num;
//       const tableOrders = get().orders.filter((o) => o.table_num === tableNum);
//       const isTableFullyServed = tableOrders.every(
//         (o) => o.status === "SERVED"
//       );

//       // 3. 만약 테이블이 모두 완료되었다면, 'fadingOutTables' 상태를 업데이트
//       if (isTableFullyServed) {
//         // 테이블 번호를 Set에 추가하여 애니메이션 시작
//         set((state) => ({
//           fadingOutTables: new Set(state.fadingOutTables).add(tableNum),
//         }));

//         await delay(ANIMATION_DURATION);

//         // 애니메이션 종료 후 Set에서 테이블 번호 제거
//         set((state) => {
//           const newSet = new Set(state.fadingOutTables);
//           newSet.delete(tableNum);
//           return { fadingOutTables: newSet };
//         });
//       }
//     }
//     // "COOKED"로 상태 되돌리기 시
//     else if (newStatus === "COOKED" && targetOrder.status === "SERVED") {
//       const tableNum = targetOrder.table_num;
//       set({
//         orders: get().orders.map((order) => {
//           if (order.id === orderId) {
//             return {
//               ...order,
//               status: "COOKED",
//               isFadingOut: false,
//               servedAt: null,
//             };
//           }
//           if (order.table_num === tableNum) {
//             return { ...order, isFadingOut: false };
//           }
//           return order;
//         }),
//       });
//     }
//     // 그 외의 모든 상태 변경
//     else {
//       set({
//         orders: get().orders.map((o) =>
//           o.id === orderId ? { ...o, status: newStatus } : o
//         ),
//       });
//     }
//   },
// }));
