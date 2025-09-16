// src/pages/liveorder_v2/LiveOrderStore.ts

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import {
  OrderItem,
  OrderStatus,
  LiveOrderWebSocketMessage,
  mapApiOrdersToOrderItems, // API 응답을 변환하는 헬퍼 함수 임포트
} from "./types";
import {
  updateOrderToCooked,
  updateOrderToServed,
  revertOrderStatus,
} from "./services/LiveOrderServiceV2";
import LiveOrderWebSocketService from "./services/LiveOrderWebSocketService";

export type OrderViewMode = "kitchen" | "serving";
const ANIMATION_DURATION = 1000; // 1초

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

interface LiveOrderState {
  orders: OrderItem[];
  menuList: string[];
  viewMode: OrderViewMode;
  fadingOutTables: Set<number>;
  webSocketService: LiveOrderWebSocketService | null;
  accessToken: string | null;

  setOrders: (orders: OrderItem[]) => void;
  setMenuList: (menuNames: string[]) => void;
  setViewMode: (mode: OrderViewMode) => void;
  updateOrderStatusWithAnimation: (
    orderId: number,
    newStatus: OrderStatus
  ) => void;
  // addNewOrders는 웹소켓 로직에 통합되어 삭제됨

  initializeWebSocket: (token: string) => void;
  disconnectWebSocket: () => void;
  reconnectWebSocket: () => void;
}

export const useLiveOrderStore = create<LiveOrderState>()(
  devtools((set, get) => ({
    orders: [],
    menuList: [],
    viewMode: "kitchen",
    fadingOutTables: new Set(),
    webSocketService: null,
    accessToken: null,

    setOrders: (orders) => set({ orders }),
    setMenuList: (menuNames) => set({ menuList: ["전체", ...menuNames] }),
    setViewMode: (mode) => set({ viewMode: mode }),

    updateOrderStatusWithAnimation: async (orderId, newStatus) => {
      // ... 이 함수의 기존 로직은 변경되지 않았습니다 ...
      const targetOrder = get().orders.find((o) => o.id === orderId);
      if (!targetOrder) return;
      const currentStatus = targetOrder.status;
      try {
        if (currentStatus === "pending" && newStatus === "cooked") {
          await updateOrderToCooked(orderId);
        } else if (currentStatus === "cooked" && newStatus === "served") {
          await updateOrderToServed(orderId);
        } else if (currentStatus === "served" && newStatus === "cooked") {
          await revertOrderStatus(orderId, "cooked");
        } else if (currentStatus === "cooked" && newStatus === "pending") {
          await revertOrderStatus(orderId, "pending");
        }
        if (newStatus === "served") {
          set((state) => ({
            orders: state.orders.map((order) =>
              order.id === orderId ? { ...order, isFadingOut: true } : order
            ),
          }));
          await delay(ANIMATION_DURATION);
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
        } else {
          set({
            orders: get().orders.map((o) =>
              o.id === orderId ? { ...o, status: newStatus } : o
            ),
          });
        }
      } catch (error) {
        console.error(`🔴 주문 상태 변경 실패: ${error}`);
      }
    },

    // --- ✨ 웹소켓 액션 구현 (로직 수정) ---
    initializeWebSocket: (token: string) => {
      get().webSocketService?.disconnect();

      const updateStoreCallback = (message: LiveOrderWebSocketMessage) => {
        // message.data.orders가 없는 경우를 방어
        if (!message.data?.orders) return;

        // API 응답 데이터를 UI에서 사용하는 OrderItem[] 형태로 변환
        const incomingOrders = mapApiOrdersToOrderItems(message.data.orders);

        if (message.type === "ORDER_SNAPSHOT") {
          // --- 📸 스냅샷: 모든 주문 데이터를 교체합니다. ---
          console.log("📸 ORDER_SNAPSHOT 수신", incomingOrders);
          const sortedOrders = incomingOrders.sort(
            (a, b) =>
              new Date(a.created_at).getTime() -
              new Date(b.created_at).getTime()
          );
          set({ orders: sortedOrders });

          // 메뉴 리스트도 스냅샷 기준으로 새로고침
          const menuNames = [
            ...new Set(incomingOrders.map((o) => o.menu_name)),
          ];
          get().setMenuList(menuNames);
        } else if (message.type === "ORDER_UPDATE") {
          // --- 🔄 업데이트: 기존 주문 데이터에 변경사항을 병합합니다. ---
          console.log("🔄 ORDER_UPDATE 수신", incomingOrders);
          set((state) => {
            const orderMap = new Map(
              state.orders.map((order) => [order.id, order])
            );

            // 새로 들어온 주문으로 기존 데이터를 덮어쓰거나 추가
            incomingOrders.forEach((order) => {
              orderMap.set(order.id, { ...orderMap.get(order.id), ...order });
            });

            const mergedOrders = Array.from(orderMap.values());
            const sortedOrders = mergedOrders.sort(
              (a, b) =>
                new Date(a.created_at).getTime() -
                new Date(b.created_at).getTime()
            );
            return { orders: sortedOrders };
          });
        }
      };

      const newWsService = new LiveOrderWebSocketService(
        token,
        updateStoreCallback
      );
      set({ webSocketService: newWsService, accessToken: token });
      newWsService.connect();
    },

    disconnectWebSocket: () => {
      get().webSocketService?.disconnect();
      set({ webSocketService: null, accessToken: null });
    },

    reconnectWebSocket: () => {
      const { accessToken } = get();
      if (accessToken) {
        console.log("🔄 웹소켓 재연결을 시도합니다...");
        get().initializeWebSocket(accessToken);
      } else {
        console.error("🔴 AccessToken이 없어 재연결할 수 없습니다.");
      }
    },
  }))
);
// // src/pages/liveorder_v2/LiveOrderStore.ts

// import { create } from "zustand";
// import { devtools } from "zustand/middleware";
// import { OrderItem, OrderStatus } from "./types";
// import {
//   updateOrderToCooked,
//   updateOrderToServed,
//   revertOrderStatus,
// } from "./services/LiveOrderServiceV2"; // 새로 만든 API 서비스 임포트

// export type OrderViewMode = "kitchen" | "serving";
// const ANIMATION_DURATION = 1000; // 1초

// const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

// interface LiveOrderState {
//   orders: OrderItem[];
//   menuList: string[];
//   viewMode: OrderViewMode;
//   fadingOutTables: Set<number>;
//   setOrders: (orders: OrderItem[]) => void;
//   setMenuList: (menuNames: string[]) => void;
//   setViewMode: (mode: OrderViewMode) => void;
//   updateOrderStatusWithAnimation: (
//     orderId: number,
//     newStatus: OrderStatus
//   ) => void;
//   addNewOrders: (newOrders: OrderItem[]) => void;
// }

// export const useLiveOrderStore = create<LiveOrderState>()(
//   devtools((set, get) => ({
//     orders: [],
//     menuList: [],
//     viewMode: "kitchen",
//     fadingOutTables: new Set(),

//     setOrders: (orders) => set({ orders }),

//     setMenuList: (menuNames) => set({ menuList: menuNames }),

//     setViewMode: (mode) => set({ viewMode: mode }),

//     updateOrderStatusWithAnimation: async (orderId, newStatus) => {
//       const targetOrder = get().orders.find((o) => o.id === orderId);
//       if (!targetOrder) return;

//       const currentStatus = targetOrder.status;

//       try {
//         // API 호출 로직 추가
//         if (currentStatus === "pending" && newStatus === "cooked") {
//           await updateOrderToCooked(orderId);
//         } else if (currentStatus === "cooked" && newStatus === "served") {
//           await updateOrderToServed(orderId);
//         } else if (currentStatus === "served" && newStatus === "cooked") {
//           await revertOrderStatus(orderId, "cooked");
//         } else if (currentStatus === "cooked" && newStatus === "pending") {
//           await revertOrderStatus(orderId, "pending");
//         } else {
//           // API 호출이 필요 없는 상태 변경일 경우 (예: 초기화 등)
//           set({
//             orders: get().orders.map((o) =>
//               o.id === orderId ? { ...o, status: newStatus } : o
//             ),
//           });
//           return;
//         }

//         // API 호출이 성공한 경우에만 기존 로직 실행
//         if (newStatus === "served") {
//           set((state) => ({
//             orders: state.orders.map((order) =>
//               order.id === orderId ? { ...order, isFadingOut: true } : order
//             ),
//           }));

//           await delay(ANIMATION_DURATION);

//           const ordersAfterItemServed = get().orders.map((order) =>
//             order.id === orderId
//               ? {
//                   ...order,
//                   status: "served" as OrderStatus,
//                   isFadingOut: false,
//                   servedAt: Date.now(),
//                 }
//               : order
//           );
//           set({ orders: ordersAfterItemServed });

//           const tableNum = targetOrder.table_num;
//           const tableOrders = get().orders.filter(
//             (o) => o.table_num === tableNum
//           );
//           const isTableFullyServed = tableOrders.every(
//             (o) => o.status === "served"
//           );

//           if (isTableFullyServed) {
//             set((state) => ({
//               fadingOutTables: new Set(state.fadingOutTables).add(tableNum),
//             }));

//             await delay(ANIMATION_DURATION);

//             set((state) => {
//               const newSet = new Set(state.fadingOutTables);
//               newSet.delete(tableNum);
//               return { fadingOutTables: newSet };
//             });
//           }
//         } else {
//           set({
//             orders: get().orders.map((o) =>
//               o.id === orderId ? { ...o, status: newStatus } : o
//             ),
//           });
//         }
//       } catch (error) {
//         console.error(`🔴 주문 상태 변경 실패: ${error}`);
//       }
//     },

//     addNewOrders: (newOrders) =>
//       set((state) => {
//         const existingOrderIds = new Set(state.orders.map((order) => order.id));
//         const uniqueNewOrders = newOrders.filter(
//           (order) => !existingOrderIds.has(order.id)
//         );
//         return { orders: [...state.orders, ...uniqueNewOrders] };
//       }),
//   }))
// );
// // import { create } from "zustand";
// // import { OrderItem, OrderStatus } from "./types";
// // import {
// //   MenuItem,
// //   DUMMY_MENU_LIST,
// //   DUMMY_LIVE_ORDERS,
// // } from "./dummy/DummyData";

// // export type OrderViewMode = "kitchen" | "serving";
// // const ANIMATION_DURATION = 1000; // 1초

// // // async/await를 사용하기 위한 delay 헬퍼 함수
// // const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

// // interface LiveOrderState {
// //   viewMode: OrderViewMode;
// //   setViewMode: (mode: OrderViewMode) => void;
// //   menuItems: MenuItem[];
// //   fetchMenuItems: () => void;
// //   orders: OrderItem[];
// //   fadingOutTables: Set<number>; // 👈 테이블 페이드아웃 상태 추가
// //   fetchOrders: () => void;
// //   updateOrderStatusWithAnimation: (
// //     orderId: number,
// //     newStatus: OrderStatus
// //   ) => void;
// // }

// // export const useLiveOrderStore = create<LiveOrderState>((set, get) => ({
// //   viewMode: "kitchen",
// //   setViewMode: (mode) => set({ viewMode: mode }),
// //   menuItems: [],
// //   fetchMenuItems: () => {
// //     const allMenu: MenuItem = { id: 0, name: "전체" };
// //     const menuListWithAll = [allMenu, ...DUMMY_MENU_LIST];
// //     set({ menuItems: menuListWithAll });
// //   },
// //   orders: [],
// //   fadingOutTables: new Set(), // 👈 상태 초기화
// //   fetchOrders: () => {
// //     const sortedOrders = [...DUMMY_LIVE_ORDERS].sort(
// //       (a, b) =>
// //         new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
// //     );
// //     set({ orders: sortedOrders });
// //   },
// //   updateOrderStatusWithAnimation: async (orderId, newStatus) => {
// //     const targetOrder = get().orders.find((o) => o.id === orderId);
// //     if (!targetOrder) return;

// //     if (newStatus === "SERVED") {
// //       // 1. MenuList 아이템 페이드아웃 시작
// //       set((state) => ({
// //         orders: state.orders.map((order) =>
// //           order.id === orderId ? { ...order, isFadingOut: true } : order
// //         ),
// //       }));

// //       await delay(ANIMATION_DURATION);

// //       // 2. 상태를 'SERVED'로 변경 (이때는 isFadingOut을 건드리지 않음)
// //       const ordersAfterItemServed = get().orders.map((order) =>
// //         order.id === orderId
// //           ? {
// //               ...order,
// //               status: "SERVED" as OrderStatus,
// //               isFadingOut: false,
// //               servedAt: Date.now(),
// //             }
// //           : order
// //       );
// //       set({ orders: ordersAfterItemServed });

// //       const tableNum = targetOrder.table_num;
// //       const tableOrders = get().orders.filter((o) => o.table_num === tableNum);
// //       const isTableFullyServed = tableOrders.every(
// //         (o) => o.status === "SERVED"
// //       );

// //       // 3. 만약 테이블이 모두 완료되었다면, 'fadingOutTables' 상태를 업데이트
// //       if (isTableFullyServed) {
// //         // 테이블 번호를 Set에 추가하여 애니메이션 시작
// //         set((state) => ({
// //           fadingOutTables: new Set(state.fadingOutTables).add(tableNum),
// //         }));

// //         await delay(ANIMATION_DURATION);

// //         // 애니메이션 종료 후 Set에서 테이블 번호 제거
// //         set((state) => {
// //           const newSet = new Set(state.fadingOutTables);
// //           newSet.delete(tableNum);
// //           return { fadingOutTables: newSet };
// //         });
// //       }
// //     }
// //     // "COOKED"로 상태 되돌리기 시
// //     else if (newStatus === "COOKED" && targetOrder.status === "SERVED") {
// //       const tableNum = targetOrder.table_num;
// //       set({
// //         orders: get().orders.map((order) => {
// //           if (order.id === orderId) {
// //             return {
// //               ...order,
// //               status: "COOKED",
// //               isFadingOut: false,
// //               servedAt: null,
// //             };
// //           }
// //           if (order.table_num === tableNum) {
// //             return { ...order, isFadingOut: false };
// //           }
// //           return order;
// //         }),
// //       });
// //     }
// //     // 그 외의 모든 상태 변경
// //     else {
// //       set({
// //         orders: get().orders.map((o) =>
// //           o.id === orderId ? { ...o, status: newStatus } : o
// //         ),
// //       });
// //     }
// //   },
// // }));
