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
  completedTables: Set<number>; // 완료된 테이블 ID들
  completedTableTimes: Map<number, number>; // 완료된 테이블의 완료 시간

  setOrders: (orders: OrderItem[]) => void;
  setMenuList: (menuNames: string[]) => void;
  setViewMode: (mode: OrderViewMode) => void;
  updateOrderStatusWithAnimation: (
    orderId: number,
    newStatus: OrderStatus
  ) => void;

  initializeWebSocket: (token: string) => void;
  disconnectWebSocket: () => void;
  reconnectWebSocket: () => void;
  checkAndRemoveExpiredTables: () => void; // 만료된 테이블 체크 및 제거
}

// 타이머 관리 변수들
let checkInterval: NodeJS.Timeout | null = null;

// 타이머 시작 함수
const startExpiredTableChecker = () => {
  if (checkInterval) {
    clearInterval(checkInterval);
  }

  checkInterval = setInterval(() => {
    useLiveOrderStore.getState().checkAndRemoveExpiredTables();
  }, 60000); // 1분마다 체크
};

// 타이머 정리 함수
const stopExpiredTableChecker = () => {
  if (checkInterval) {
    clearInterval(checkInterval);
    checkInterval = null;
  }
};

export const useLiveOrderStore = create<LiveOrderState>()(
  devtools((set, get) => ({
    orders: [],
    menuList: [],
    viewMode: "kitchen",
    fadingOutTables: new Set(),
    webSocketService: null,
    accessToken: null,
    pendingOrderUpdates: new Set(),
    completedTables: new Set(),
    completedTableTimes: new Map(),

    setOrders: (orders) => set({ orders }),
    setMenuList: (menuNames) => set({ menuList: ["전체", ...menuNames] }),
    setViewMode: (mode) => set({ viewMode: mode }),

    updateOrderStatusWithAnimation: async (orderId, newStatus) => {
      const targetOrder = get().orders.find((o) => o.id === orderId);
      if (!targetOrder) return;
      const currentStatus = targetOrder.status;

      if (get().pendingOrderUpdates.has(orderId)) {
        return;
      }

      try {
        set((state) => ({
          pendingOrderUpdates: new Set(state.pendingOrderUpdates).add(orderId),
        }));

        if (currentStatus === "pending" && newStatus === "cooked") {
          await updateOrderToCooked(orderId);
        } else if (currentStatus === "cooked" && newStatus === "served") {
          await updateOrderToServed(orderId);
        } else if (currentStatus === "served" && newStatus === "cooked") {
          await revertOrderStatus(orderId, "cooked");
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

            // 페이드아웃 완료 후 완료된 테이블로 표시하고 완료 시간 기록 (하단으로 이동)
            set((state) => ({
              fadingOutTables: new Set(
                [...state.fadingOutTables].filter((id) => id !== orderGroupId)
              ),
              completedTables: new Set(state.completedTables).add(orderGroupId),
              completedTableTimes: new Map(state.completedTableTimes).set(
                orderGroupId,
                Date.now()
              ),
            }));
          }
        } else {
          // 주문 상태가 되돌려질 때 완료 상태 체크
          const orderGroupId = targetOrder.order_id;

          // 먼저 주문 상태를 업데이트
          set({
            orders: get().orders.map((o) =>
              o.id === orderId ? { ...o, status: newStatus } : o
            ),
          });

          // 업데이트된 상태로 완료 상태 체크
          const updatedOrders = get().orders.map((o) =>
            o.id === orderId ? { ...o, status: newStatus } : o
          );
          const groupOrders = updatedOrders.filter(
            (o) => o.order_id === orderGroupId
          );
          const isGroupFullyServed = groupOrders.every(
            (o) => o.status === "served"
          );

          // 그룹이 더 이상 완전히 서빙되지 않으면 완료 상태에서 제거
          if (!isGroupFullyServed) {
            set((state) => {
              const newCompletedTables = new Set(state.completedTables);
              const newCompletedTableTimes = new Map(state.completedTableTimes);
              newCompletedTables.delete(orderGroupId);
              newCompletedTableTimes.delete(orderGroupId);

              return {
                completedTables: newCompletedTables,
                completedTableTimes: newCompletedTableTimes,
              };
            });
          }
        }
      } catch (error) {
        console.error(`주문 상태 변경 실패: ${error}`);
      } finally {
        set((state) => {
          const newSet = new Set(state.pendingOrderUpdates);
          newSet.delete(orderId);
          return { pendingOrderUpdates: newSet };
        });
      }
    },

    initializeWebSocket: (token: string) => {
      get().webSocketService?.disconnect();

      const updateStoreCallback = (message: LiveOrderWebSocketMessage) => {
        if (message.type === "ORDER_SNAPSHOT") {
          const apiOrders = message.data.orders;
          if (!apiOrders) return;

          const incomingOrders = mapApiOrdersToOrderItems(apiOrders);
          const sortedOrders = incomingOrders.sort(
            (a, b) =>
              new Date(a.created_at).getTime() -
              new Date(b.created_at).getTime()
          );
          set({ orders: sortedOrders });

          const menuNames = [
            ...new Set(incomingOrders.map((o) => o.menu_name)),
          ];
          get().setMenuList(menuNames);
        } else if (message.type === "ORDER_UPDATE") {
          let apiOrders: any[] = [];
          const data = message.data as any;
          if (Array.isArray(data.orders)) {
            apiOrders = data.orders;
          } else if (data.ordermenu_id) {
            apiOrders = [data];
          }
          if (apiOrders.length === 0) return;

          const incomingOrders = mapApiOrdersToOrderItems(apiOrders);
          set((state) => {
            const orderMap = new Map(
              state.orders.map((order) => [order.id, order])
            );
            const pendingUpdates = state.pendingOrderUpdates;

            incomingOrders.forEach((order) => {
              if (pendingUpdates.has(order.id)) return;
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

            // menu_num이 0인 주문들 제거
            const filteredOrders = sortedOrders.filter(
              (order) => order.menu_num > 0
            );

            return { orders: filteredOrders };
          });
        } else if (message.type === "ORDER_COMPLETED") {
          console.log("✅ ORDER_COMPLETED 수신:", message.data);
          const { order_id, served_at } = message.data;
          // 완료된 테이블로 표시하고 완료 시간 기록
          set((state) => ({
            completedTables: new Set(state.completedTables).add(order_id),
            completedTableTimes: new Map(state.completedTableTimes).set(
              order_id,
              new Date(served_at).getTime()
            ),
            orders: state.orders.map((order) =>
              order.order_id === order_id
                ? { ...order, completedAt: new Date(served_at).getTime() }
                : order
            ),
          }));
        } else if (message.type === "ORDER_CANCELLED") {
          console.log("❌ ORDER_CANCELLED 수신:", message.data);

          set((state) => {
            // 현재 orders 상태도 로그로 찍어보기
            console.log(
              "현재 orders 상태:",
              state.orders.map((order) => ({
                id: order.id,
                menu_name: order.menu_name,
                menu_num: order.menu_num,
              }))
            );

            // menu_num이 0인 주문들만 제거
            const updatedOrders = state.orders.filter(
              (order) => order.menu_num > 0
            );

            console.log(
              " 취소 후 orders:",
              updatedOrders.map((order) => ({
                id: order.id,
                menu_name: order.menu_name,
                menu_num: order.menu_num,
              }))
            );

            return { orders: updatedOrders };
          });
        }
      };

      const newWsService = new LiveOrderWebSocketService(
        token,
        updateStoreCallback
      );
      set({ webSocketService: newWsService, accessToken: token });
      newWsService.connect();

      // 타이머 시작
      startExpiredTableChecker();
    },

    disconnectWebSocket: () => {
      get().webSocketService?.disconnect();
      set({ webSocketService: null, accessToken: null });

      // 타이머 정리
      stopExpiredTableChecker();
    },

    reconnectWebSocket: () => {
      const { accessToken } = get();
      if (accessToken) {
        get().initializeWebSocket(accessToken);
      }
    },
    checkAndRemoveExpiredTables: () => {
      const now = Date.now();
      const countTime = 1 * 60 * 1000; // 3분을 밀리초로 변환

      set((state) => {
        const expiredTables = new Set<number>();
        const newCompletedTableTimes = new Map(state.completedTableTimes);

        // 만료된 테이블 찾기
        state.completedTableTimes.forEach((completedTime, tableId) => {
          if (now - completedTime >= countTime) {
            expiredTables.add(tableId);
            newCompletedTableTimes.delete(tableId);
          }
        });

        if (expiredTables.size > 0) {
          // 만료된 테이블들을 페이드아웃 상태로 설정
          const updatedOrders = state.orders.map((order) =>
            expiredTables.has(order.order_id)
              ? { ...order, isFadingOut: true }
              : order
          );

          // 페이드아웃 애니메이션 후 실제 제거
          setTimeout(() => {
            set((state) => ({
              orders: state.orders.filter(
                (order) => !expiredTables.has(order.order_id)
              ),
              completedTables: new Set(
                [...state.completedTables].filter(
                  (id) => !expiredTables.has(id)
                )
              ),
              completedTableTimes: newCompletedTableTimes,
            }));
          }, ANIMATION_DURATION);

          return {
            orders: updatedOrders,
            completedTables: new Set(
              [...state.completedTables].filter((id) => !expiredTables.has(id))
            ),
            completedTableTimes: newCompletedTableTimes,
          };
        }

        return state;
      });
    },
  }))
);

// // 3분마다 만료된 테이블 체크하는 타이머 설정
// setInterval(() => {
//   useLiveOrderStore.getState().checkAndRemoveExpiredTables();
// }, 60000); // 1분마다 체크

// // 3분마다 만료된 테이블 체크하는 타이머 설정
// let checkInterval: NodeJS.Timeout | null = null;

// // 타이머 시작 함수
// const startExpiredTableChecker = () => {
//   if (checkInterval) {
//     clearInterval(checkInterval);
//   }

//   checkInterval = setInterval(() => {
//     useLiveOrderStore.getState().checkAndRemoveExpiredTables();
//   }, 60000); // 1분마다 체크
// };

// // 타이머 정리 함수
// const stopExpiredTableChecker = () => {
//   if (checkInterval) {
//     clearInterval(checkInterval);
//     checkInterval = null;
//   }
// };

// // 웹소켓 연결 시 타이머 시작
// export const initializeExpiredTableChecker = () => {
//   startExpiredTableChecker();
// };

// // 웹소켓 연결 해제 시 타이머 정리
// export const cleanupExpiredTableChecker = () => {
//   stopExpiredTableChecker();
// };
