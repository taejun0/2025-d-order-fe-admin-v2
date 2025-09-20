// src/pages/liveorder_v2/LiveOrderStore.ts

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import {
  OrderItem,
  OrderStatus,
  LiveOrderWebSocketMessage,
  mapApiOrdersToOrderItems,
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
  pendingOrderUpdates: Set<number>;
  debugMessages: string[]; // 디버깅 메시지 추가

  setOrders: (orders: OrderItem[]) => void;
  setMenuList: (menuNames: string[]) => void;
  setViewMode: (mode: OrderViewMode) => void;
  updateOrderStatusWithAnimation: (
    orderId: number,
    newStatus: OrderStatus
  ) => void;
  addDebugMessage: (message: string) => void; // 디버깅 메시지 추가 함수

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
    pendingOrderUpdates: new Set(),
    debugMessages: [],

    setOrders: (orders) => set({ orders }),
    setMenuList: (menuNames) => set({ menuList: ["전체", ...menuNames] }),
    setViewMode: (mode) => set({ viewMode: mode }),
    addDebugMessage: (message) => {
      set((state) => ({
        debugMessages: [...state.debugMessages.slice(-4), ` ${message}`],
      }));
    },

    updateOrderStatusWithAnimation: async (orderId, newStatus) => {
      get().addDebugMessage(
        `🔍 받은 orderId: ${orderId} (타입: ${typeof orderId})`
      );

      const targetOrder = get().orders.find((o) => o.id === orderId);
      if (!targetOrder) {
        get().addDebugMessage(`❌ 주문 없음: ${orderId}`);
        return;
      }

      const currentStatus = targetOrder.status;
      get().addDebugMessage(` 시작: ${currentStatus}→${newStatus}`);

      //"서빙완료→조리완료" 되돌리기는 잠금 체크 제외
      const isRevertFromServed =
        currentStatus === "served" && newStatus === "cooked";

      // iOS 크롬 대응: 되돌리기 케이스에서도 약간의 지연 추가
      if (isRevertFromServed) {
        get().addDebugMessage("⏳ iOS 지연 처리");
        await new Promise((resolve) => setTimeout(resolve, 200));
      }

      if (!isRevertFromServed && get().pendingOrderUpdates.has(orderId)) {
        get().addDebugMessage(" 이미 처리중");
        return;
      }

      try {
        if (!isRevertFromServed) {
          set((state) => ({
            pendingOrderUpdates: new Set(state.pendingOrderUpdates).add(
              orderId
            ),
          }));
        }

        get().addDebugMessage(" API 호출 시작");

        if (currentStatus === "pending" && newStatus === "cooked") {
          await updateOrderToCooked(orderId);
          get().addDebugMessage("✅ 조리완료 API 완료");
        } else if (currentStatus === "cooked" && newStatus === "served") {
          await updateOrderToServed(orderId);
          get().addDebugMessage("✅ 서빙완료 API 완료");
        } else if (currentStatus === "served" && newStatus === "cooked") {
          try {
            // iOS 크롬 대응: 되돌리기 전에 현재 상태를 다시 확인
            const currentOrder = get().orders.find((o) => o.id === orderId);
            if (currentOrder?.status !== "served") {
              get().addDebugMessage(`❌ 상태 변경됨: ${currentOrder?.status}`);
              return;
            }

            get().addDebugMessage(`🔄 되돌리기 시도: ${orderId} → cooked`);
            await revertOrderStatus(orderId, "cooked");
            get().addDebugMessage("✅ 되돌리기 API 완료");

            // 🔥 핵심 변경: 되돌리기는 웹소켓 메시지 기반으로 UI 업데이트
            // 클라이언트에서 직접 UI를 업데이트하지 않음
            get().addDebugMessage("⏳ 웹소켓 응답 대기 중...");
            return; // UI 업데이트를 웹소켓에 맡김
          } catch (revertError) {
            get().addDebugMessage(`❌ 되돌리기 실패: ${revertError}`);
            throw revertError;
          }
        }

        get().addDebugMessage("🎨 UI 업데이트 시작");

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

          const orderGroupId = targetOrder.order_id;
          const groupOrders = get().orders.filter(
            (o) => o.order_id === orderGroupId
          );
          const isGroupFullyServed = groupOrders.every(
            (o) => o.status === "served"
          );
          if (isGroupFullyServed) {
            set((state) => ({
              fadingOutTables: new Set(state.fadingOutTables).add(orderGroupId),
            }));
            await delay(ANIMATION_DURATION);
            set((state) => {
              const newSet = new Set(state.fadingOutTables);
              newSet.delete(orderGroupId);
              return { fadingOutTables: newSet };
            });
          }
        } else {
          // 조리완료, 서빙완료는 기존대로 클라이언트에서 UI 업데이트
          set({
            orders: get().orders.map((o) =>
              o.id === orderId ? { ...o, status: newStatus } : o
            ),
          });
          get().addDebugMessage(`✅ UI 업데이트 완료: ${newStatus}`);
        }
      } catch (error) {
        get().addDebugMessage(`❌ 에러: ${error}`);
      } finally {
        if (!isRevertFromServed) {
          set((state) => {
            const newSet = new Set(state.pendingOrderUpdates);
            newSet.delete(orderId);
            return { pendingOrderUpdates: newSet };
          });
          get().addDebugMessage(" 잠금 해제");
        }
      }
    },
    initializeWebSocket: (token: string) => {
      get().webSocketService?.disconnect();

      const updateStoreCallback = (message: LiveOrderWebSocketMessage) => {
        // ORDER_UPDATE 메시지에서 orders가 배열이 아닐 수도 있으므로 배열로 변환
        let apiOrders: any[] = [];
        if (message.type === "ORDER_UPDATE") {
          const data = message.data as any;
          // 새로운 주문 추가(여러 개): orders 배열로 오면 배열로 처리
          if (Array.isArray(data.orders)) {
            apiOrders = data.orders;
          }
          // 상태 변경(단일): 단일 객체로 오면 배열로 변환
          else if (data.ordermenu_id) {
            apiOrders = [data];
          }
        } else if (message.type === "ORDER_SNAPSHOT") {
          apiOrders = message.data.orders;
        }
        if (!apiOrders || apiOrders.length === 0) return;

        const incomingOrders = mapApiOrdersToOrderItems(apiOrders);

        if (message.type === "ORDER_SNAPSHOT") {
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
          console.log(" ORDER_UPDATE 수신", incomingOrders);

          set((state) => {
            const orderMap = new Map(
              state.orders.map((order) => [order.id, order])
            );
            const pendingUpdates = state.pendingOrderUpdates;

            // 🔥 크롬 대응: 모든 incomingOrders에 대해 잠금 해제 체크
            const newPendingUpdates = new Set(pendingUpdates);

            incomingOrders.forEach((order) => {
              // 되돌리기 성공 케이스 체크 (서빙완료→조리완료)
              const isRevertFromServed =
                orderMap.has(order.id) &&
                orderMap.get(order.id)?.status === "served" &&
                order.status === "cooked";

              // 🔥 핵심: 되돌리기 성공이면 잠금 해제
              if (isRevertFromServed && pendingUpdates.has(order.id)) {
                newPendingUpdates.delete(order.id);
              }

              //  핵심 수정: 되돌리기가 아닌 경우만 잠금 체크 (iOS 크롬 제외 로직 제거)
              if (pendingUpdates.has(order.id) && !isRevertFromServed) return;

              // 기존 주문이면 병합, 없으면 추가
              if (orderMap.has(order.id)) {
                orderMap.set(order.id, { ...orderMap.get(order.id), ...order });
              } else {
                orderMap.set(order.id, order);
              }
            });

            const mergedOrders = Array.from(orderMap.values());
            const sortedOrders = mergedOrders.sort(
              (a, b) =>
                new Date(a.created_at).getTime() -
                new Date(b.created_at).getTime()
            );
            return {
              orders: sortedOrders,
              pendingOrderUpdates: newPendingUpdates,
            };
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
// import {
//   OrderItem,
//   OrderStatus,
//   LiveOrderWebSocketMessage,
//   mapApiOrdersToOrderItems,
// } from "./types";
// import {
//   updateOrderToCooked,
//   updateOrderToServed,
//   revertOrderStatus,
// } from "./services/LiveOrderServiceV2";
// import LiveOrderWebSocketService from "./services/LiveOrderWebSocketService";

// export type OrderViewMode = "kitchen" | "serving";
// const ANIMATION_DURATION = 1000; // 1초

// const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

// interface LiveOrderState {
//   orders: OrderItem[];
//   menuList: string[];
//   viewMode: OrderViewMode;
//   fadingOutTables: Set<number>;
//   webSocketService: LiveOrderWebSocketService | null;
//   accessToken: string | null;
//   pendingOrderUpdates: Set<number>;

//   setOrders: (orders: OrderItem[]) => void;
//   setMenuList: (menuNames: string[]) => void;
//   setViewMode: (mode: OrderViewMode) => void;
//   updateOrderStatusWithAnimation: (
//     orderId: number,
//     newStatus: OrderStatus
//   ) => void;

//   initializeWebSocket: (token: string) => void;
//   disconnectWebSocket: () => void;
//   reconnectWebSocket: () => void;
// }

// export const useLiveOrderStore = create<LiveOrderState>()(
//   devtools((set, get) => ({
//     orders: [],
//     menuList: [],
//     viewMode: "kitchen",
//     fadingOutTables: new Set(),
//     webSocketService: null,
//     accessToken: null,
//     pendingOrderUpdates: new Set(),

//     setOrders: (orders) => set({ orders }),
//     setMenuList: (menuNames) => set({ menuList: ["전체", ...menuNames] }),
//     setViewMode: (mode) => set({ viewMode: mode }),

//     updateOrderStatusWithAnimation: async (orderId, newStatus) => {
//       const targetOrder = get().orders.find((o) => o.id === orderId);
//       if (!targetOrder) return;
//       const currentStatus = targetOrder.status;

//       //"서빙완료→조리완료" 되돌리기는 잠금 체크 제외
//       const isRevertFromServed =
//         currentStatus === "served" && newStatus === "cooked";

//       // iOS 크롬 대응: 되돌리기 케이스에서도 약간의 지연 추가
//       if (isRevertFromServed) {
//         console.log("iOS 크롬 대응: 되돌리기 처리 지연후 추가", orderId);
//         // iOS 크롬에서 터치 이벤트가 제대로 처리되도록 약간의 지연
//         await new Promise((resolve) => setTimeout(resolve, 100));
//       }

//       if (!isRevertFromServed && get().pendingOrderUpdates.has(orderId)) {
//         console.log(`🟡 Order ${orderId} update is already in progress.`);
//         return;
//       }

//       try {
//         if (!isRevertFromServed) {
//           set((state) => ({
//             pendingOrderUpdates: new Set(state.pendingOrderUpdates).add(
//               orderId
//             ),
//           }));
//         }
//         if (currentStatus === "pending" && newStatus === "cooked") {
//           await updateOrderToCooked(orderId);
//         } else if (currentStatus === "cooked" && newStatus === "served") {
//           await updateOrderToServed(orderId);
//         } else if (currentStatus === "served" && newStatus === "cooked") {
//           console.log("서빙완료 → 조리완료 revertOrderStatus 호출");
//           await revertOrderStatus(orderId, "cooked");
//         }

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

//           const orderGroupId = targetOrder.order_id;
//           const groupOrders = get().orders.filter(
//             (o) => o.order_id === orderGroupId
//           );
//           const isGroupFullyServed = groupOrders.every(
//             (o) => o.status === "served"
//           );
//           if (isGroupFullyServed) {
//             set((state) => ({
//               fadingOutTables: new Set(state.fadingOutTables).add(orderGroupId),
//             }));
//             await delay(ANIMATION_DURATION);
//             set((state) => {
//               const newSet = new Set(state.fadingOutTables);
//               newSet.delete(orderGroupId);
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
//       } finally {
//         if (!isRevertFromServed) {
//           set((state) => {
//             const newSet = new Set(state.pendingOrderUpdates);
//             newSet.delete(orderId);
//             return { pendingOrderUpdates: newSet };
//           });
//           console.log("pendingOrderUpdates 해제됨:", orderId);
//         }
//       }
//     },

//     initializeWebSocket: (token: string) => {
//       get().webSocketService?.disconnect();

//       const updateStoreCallback = (message: LiveOrderWebSocketMessage) => {
//         // ORDER_UPDATE 메시지에서 orders가 배열이 아닐 수도 있으므로 배열로 변환
//         let apiOrders: any[] = [];
//         if (message.type === "ORDER_UPDATE") {
//           const data = message.data as any;
//           // 새로운 주문 추가(여러 개): orders 배열로 오면 배열로 처리
//           if (Array.isArray(data.orders)) {
//             apiOrders = data.orders;
//           }
//           // 상태 변경(단일): 단일 객체로 오면 배열로 변환
//           else if (data.ordermenu_id) {
//             apiOrders = [data];
//           }
//         } else if (message.type === "ORDER_SNAPSHOT") {
//           apiOrders = message.data.orders;
//         }
//         if (!apiOrders || apiOrders.length === 0) return;

//         const incomingOrders = mapApiOrdersToOrderItems(apiOrders);

//         if (message.type === "ORDER_SNAPSHOT") {
//           console.log("📸 ORDER_SNAPSHOT 수신", incomingOrders);
//           const sortedOrders = incomingOrders.sort(
//             (a, b) =>
//               new Date(a.created_at).getTime() -
//               new Date(b.created_at).getTime()
//           );
//           set({ orders: sortedOrders });

//           // 메뉴 리스트도 스냅샷 기준으로 새로고침
//           const menuNames = [
//             ...new Set(incomingOrders.map((o) => o.menu_name)),
//           ];
//           get().setMenuList(menuNames);
//         } else if (message.type === "ORDER_UPDATE") {
//           // --- 🔄 업데이트: 기존 주문 데이터에 변경사항을 병합합니다. ---
//           console.log("🔄 ORDER_UPDATE 수신", incomingOrders);

//           set((state) => {
//             const orderMap = new Map(
//               state.orders.map((order) => [order.id, order])
//             );
//             const pendingUpdates = state.pendingOrderUpdates;

//             // 🔥 크롬 대응: 모든 incomingOrders에 대해 잠금 해제 체크
//             const newPendingUpdates = new Set(pendingUpdates);

//             incomingOrders.forEach((order) => {
//               // 되돌리기 성공 케이스 체크 (서빙완료→조리완료)
//               const isRevertFromServed =
//                 orderMap.has(order.id) &&
//                 orderMap.get(order.id)?.status === "served" &&
//                 order.status === "cooked";

//               // 🔥 핵심: 되돌리기 성공이면 잠금 해제
//               if (isRevertFromServed && pendingUpdates.has(order.id)) {
//                 newPendingUpdates.delete(order.id);
//               }

//               // 🔥 핵심 수정: 되돌리기가 아닌 경우만 잠금 체크 (iOS 크롬 제외 로직 제거)
//               if (pendingUpdates.has(order.id) && !isRevertFromServed) return;

//               // 기존 주문이면 병합, 없으면 추가
//               if (orderMap.has(order.id)) {
//                 orderMap.set(order.id, { ...orderMap.get(order.id), ...order });
//               } else {
//                 orderMap.set(order.id, order);
//               }
//             });

//             const mergedOrders = Array.from(orderMap.values());
//             const sortedOrders = mergedOrders.sort(
//               (a, b) =>
//                 new Date(a.created_at).getTime() -
//                 new Date(b.created_at).getTime()
//             );
//             return {
//               orders: sortedOrders,
//               pendingOrderUpdates: newPendingUpdates,
//             };
//           });
//         }
//       };

//       const newWsService = new LiveOrderWebSocketService(
//         token,
//         updateStoreCallback
//       );
//       set({ webSocketService: newWsService, accessToken: token });
//       newWsService.connect();
//     },

//     disconnectWebSocket: () => {
//       get().webSocketService?.disconnect();
//       set({ webSocketService: null, accessToken: null });
//     },

//     reconnectWebSocket: () => {
//       const { accessToken } = get();
//       if (accessToken) {
//         console.log("🔄 웹소켓 재연결을 시도합니다...");
//         get().initializeWebSocket(accessToken);
//       } else {
//         console.error("🔴 AccessToken이 없어 재연결할 수 없습니다.");
//       }
//     },
//   }))
// );
