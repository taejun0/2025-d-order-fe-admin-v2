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
const ANIMATION_DURATION = 1000;

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

interface LiveOrderState {
  orders: OrderItem[];
  menuList: string[];
  viewMode: OrderViewMode;
  fadingOutTables: Set<number>;
  webSocketService: LiveOrderWebSocketService | null;
  accessToken: string | null;
  pendingOrderUpdates: Set<number>;
  completedTables: Set<number>;
  completedTableTimes: Map<number, number>;

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
  checkAndRemoveExpiredTables: () => void;
}

let checkInterval: NodeJS.Timeout | null = null;

const startExpiredTableChecker = () => {
  if (checkInterval) {
    clearInterval(checkInterval);
  }

  checkInterval = setInterval(() => {
    useLiveOrderStore.getState().checkAndRemoveExpiredTables();
  }, 10000); // 10초마다 체크
};

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
              order.id === orderId
                ? {
                    ...order,
                    status: "served" as OrderStatus,
                    isFadingOut: true,
                    servedAt: Date.now(),
                  }
                : order
            ),
          }));

          setTimeout(() => {
            set((state) => ({
              orders: state.orders.map((order) =>
                order.id === orderId ? { ...order, isFadingOut: false } : order
              ),
            }));
          }, ANIMATION_DURATION);

          const orderGroupId = targetOrder.order_id;
          const groupOrdersNow = get().orders.filter(
            (o) => o.order_id === orderGroupId
          );
          const isGroupFullyServed = groupOrdersNow.every(
            (o) => o.status === "served"
          );

          if (isGroupFullyServed) {
            set((state) => ({
              fadingOutTables: new Set(state.fadingOutTables).add(orderGroupId),
            }));

            await delay(ANIMATION_DURATION);

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
          const orderGroupId = targetOrder.order_id;

          set({
            orders: get().orders.map((o) =>
              o.id === orderId ? { ...o, status: newStatus } : o
            ),
          });

          const updatedOrders = get().orders.map((o) =>
            o.id === orderId ? { ...o, status: newStatus } : o
          );
          const groupOrders = updatedOrders.filter(
            (o) => o.order_id === orderGroupId
          );
          const isGroupFullyServed = groupOrders.every(
            (o) => o.status === "served"
          );

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

            const filteredOrders = sortedOrders.filter(
              (order) => order.menu_num > 0
            );

            return { orders: filteredOrders };
          });
        } else if (message.type === "ORDER_COMPLETED") {
          const { order_id, served_at } = message.data;

          set((state) => ({
            orders: state.orders.map((order) =>
              order.order_id === order_id
                ? { ...order, completedAt: new Date(served_at).getTime() }
                : order
            ),
          }));

          const { completedTables, fadingOutTables } = get();
          if (completedTables.has(order_id)) {
            set((state) => ({
              completedTableTimes: new Map(state.completedTableTimes).set(
                order_id,
                new Date(served_at).getTime()
              ),
            }));
            return;
          }

          if (!fadingOutTables.has(order_id)) {
            set((state) => ({
              fadingOutTables: new Set(state.fadingOutTables).add(order_id),
            }));
          }

          setTimeout(() => {
            set((state) => {
              const nextFading = new Set(state.fadingOutTables);
              nextFading.delete(order_id);

              const nextCompleted = new Set(state.completedTables).add(
                order_id
              );
              const nextTimes = new Map(state.completedTableTimes).set(
                order_id,
                new Date(served_at).getTime()
              );

              return {
                fadingOutTables: nextFading,
                completedTables: nextCompleted,
                completedTableTimes: nextTimes,
              };
            });
          }, ANIMATION_DURATION);
        } else if (message.type === "ORDER_CANCELLED") {
          set((state) => {
            const updatedOrders = state.orders.filter(
              (order) => order.menu_num > 0
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

      startExpiredTableChecker();
    },

    disconnectWebSocket: () => {
      get().webSocketService?.disconnect();
      set({ webSocketService: null, accessToken: null });

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
      const countTime = 3 * 60 * 1000; // 3분을 밀리초로 변환 테이블빌 없어지는시간

      set((state) => {
        const expiredTables = new Set<number>();
        const newCompletedTableTimes = new Map(state.completedTableTimes);

        state.completedTableTimes.forEach((completedTime, tableId) => {
          if (now - completedTime >= countTime) {
            expiredTables.add(tableId);
            newCompletedTableTimes.delete(tableId);
          }
        });

        if (expiredTables.size > 0) {
          const updatedOrders = state.orders.map((order) =>
            expiredTables.has(order.order_id)
              ? { ...order, isFadingOut: true }
              : order
          );

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
