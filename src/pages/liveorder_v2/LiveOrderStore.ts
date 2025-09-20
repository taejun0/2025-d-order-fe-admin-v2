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

    setOrders: (orders) => set({ orders }),
    setMenuList: (menuNames) => set({ menuList: ["전체", ...menuNames] }),
    setViewMode: (mode) => set({ viewMode: mode }),

    updateOrderStatusWithAnimation: async (orderId, newStatus) => {
      const isIOSChrome = /CriOS/.test(navigator.userAgent);
      const targetOrder = get().orders.find((o) => o.id === orderId);
      if (!targetOrder) return;
      const currentStatus = targetOrder.status;

      //"서빙완료→조리완료" 되돌리기는 잠금 체크 제외
      const isRevertFromServed =
        currentStatus === "served" && newStatus === "cooked";

      //iOS 크롬이거나 되돌리기인 경우 잠금 체크 완전 스킵
      const shouldCheckLock = !isIOSChrome && !isRevertFromServed;

      if (shouldCheckLock && get().pendingOrderUpdates.has(orderId)) {
        console.log(`🟡 Order ${orderId} update is already in progress.`);
        return;
      }

      try {
        // iOS 크롬이거나 되돌리기가 아닌 경우만 잠금 설정
        if (!isIOSChrome && !isRevertFromServed) {
          set((state) => ({
            pendingOrderUpdates: new Set(state.pendingOrderUpdates).add(
              orderId
            ),
          }));
        }

        if (currentStatus === "pending" && newStatus === "cooked") {
          await updateOrderToCooked(orderId);
        } else if (currentStatus === "cooked" && newStatus === "served") {
          await updateOrderToServed(orderId);
        } else if (currentStatus === "served" && newStatus === "cooked") {
          console.log("서빙완료 → 조리완료 revertOrderStatus 호출");
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
            set((state) => {
              const newSet = new Set(state.fadingOutTables);
              newSet.delete(orderGroupId);
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
      } finally {
        if (!isIOSChrome && !isRevertFromServed) {
          set((state) => {
            const newSet = new Set(state.pendingOrderUpdates);
            newSet.delete(orderId);
            return { pendingOrderUpdates: newSet };
          });
          console.log("pendingOrderUpdates 해제됨:", orderId);
        }
      }
    },

    initializeWebSocket: (token: string) => {
      get().webSocketService?.disconnect();

      const updateStoreCallback = (message: LiveOrderWebSocketMessage) => {
        // iOS 크롬 감지
        const isIOSChrome = /CriOS/.test(navigator.userAgent);
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
          console.log("🔄 ORDER_UPDATE 수신", incomingOrders);

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

              // iOS 크롬이거나 되돌리기가 아닌 경우만 잠금 체크
              const shouldCheckLock = !isIOSChrome && !isRevertFromServed;
              if (shouldCheckLock && pendingUpdates.has(order.id)) return;

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
