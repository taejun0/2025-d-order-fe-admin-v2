// src/pages/liveorder_v2/hooks/useLiveOrdersWebSocket.ts

import { useEffect, useRef } from "react";
import { useLiveOrderStore } from "../LiveOrderStore";
import { LiveOrderWebSocketMessage } from "../types";
import LiveOrderWebSocketService from "../services/LiveOrderWebSocketService";

export const useLiveOrdersWebSocket = (accessToken: string | null) => {
  const { setOrders, updateOrderStatusWithAnimation, addNewOrders } =
    useLiveOrderStore();
  const serviceRef = useRef<LiveOrderWebSocketService | null>(null);

  useEffect(() => {
    if (!accessToken) {
      console.error("🔴 [CALL] 웹소켓 연결 실패: 액세스 토큰이 없습니다.");
      return;
    }

    // 상태를 가져오는 함수를 useEffect 내에서 정의하여 항상 최신 상태를 참조
    const updateStore = (message: LiveOrderWebSocketMessage) => {
      switch (message.type) {
        case "ORDER_SNAPSHOT":
          const initialOrders = message.data.orders.map((apiOrder) => ({
            id: apiOrder.ordermenu_id,
            menu_name: apiOrder.menu_name,
            menu_num: apiOrder.quantity,
            table_num: apiOrder.table_num,
            status: apiOrder.status,
            created_at: apiOrder.created_at,
            menu_image: apiOrder.menu_image,
            isFadingOut: false,
            servedAt: null,
          }));
          setOrders(initialOrders);
          break;
        case "ORDER_UPDATE":
          // ORDER_UPDATE의 orders 배열을 순회하며 처리
          message.data.orders.forEach((apiOrder) => {
            const currentOrders = useLiveOrderStore.getState().orders; // 최신 상태를 가져옴
            const isExistingOrder = currentOrders.some(
              (order) => order.id === apiOrder.ordermenu_id
            );

            if (isExistingOrder) {
              // 기존 주문이라면 상태만 업데이트
              updateOrderStatusWithAnimation(
                apiOrder.ordermenu_id,
                apiOrder.status
              );
            } else {
              // 새로운 주문이라면 추가
              const newOrderItem = {
                id: apiOrder.ordermenu_id,
                menu_name: apiOrder.menu_name,
                menu_num: apiOrder.quantity,
                table_num: apiOrder.table_num,
                status: apiOrder.status,
                created_at: apiOrder.created_at,
                menu_image: apiOrder.menu_image,
                isFadingOut: false,
                servedAt: null,
              };
              addNewOrders([newOrderItem]);
            }
          });
          break;
        default:
          // never 타입 오류 해결
          console.warn("알 수 없는 메시지 타입:", (message as any).type);
          break;
      }
    };

    serviceRef.current = new LiveOrderWebSocketService(
      accessToken,
      updateStore
    );
    serviceRef.current.connect();

    return () => {
      serviceRef.current?.disconnect();
    };
  }, [accessToken, setOrders, updateOrderStatusWithAnimation, addNewOrders]);
};
