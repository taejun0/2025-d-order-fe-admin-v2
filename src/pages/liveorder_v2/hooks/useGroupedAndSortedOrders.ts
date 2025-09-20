// // src/pages/liveorder_v2/hooks/useGroupedAndSortedOrders.ts

import { useMemo } from "react";
import { OrderItem, TableOrder } from "@pages/liveorder_v2/types";
import { useLiveOrderStore } from "@pages/liveorder_v2/LiveOrderStore";

export const useGroupedAndSortedOrders = () => {
  const { orders, completedTables, fadingOutTables } = useLiveOrderStore();

  const groupedOrders = useMemo(() => {
    const groups = new Map<number, OrderItem[]>();

    orders.forEach((order) => {
      if (!groups.has(order.order_id)) {
        groups.set(order.order_id, []);
      }
      groups.get(order.order_id)!.push(order);
    });

    const tableOrders: TableOrder[] = Array.from(groups.entries()).map(
      ([orderId, orderItems]) => {
        const isCompleted = completedTables.has(orderId);
        const completedAt = orderItems[0]?.completedAt || null;
        const isFadingOut = fadingOutTables.has(orderId);

        return {
          tableId: orderId,
          tableName: `테이블 ${orderItems[0]?.table_num || 0}`,
          orders: orderItems,
          isCompleted,
          completedAt,
          isFadingOut,
        };
      }
    );

    // 정렬 로직: 페이드아웃 중인 테이블은 현재 위치 유지, 완료된 테이블만 하단으로
    return tableOrders.sort((a, b) => {
      // 페이드아웃 중인 테이블은 정렬하지 않고 현재 위치 유지
      if (a.isFadingOut || b.isFadingOut) {
        return 0;
      }

      // 페이드아웃이 아닌 테이블들만 완료 상태에 따라 정렬
      if (a.isCompleted && !b.isCompleted) return 1;
      if (!a.isCompleted && b.isCompleted) return -1;

      return 0;
    });
  }, [orders, completedTables, fadingOutTables]);
  return groupedOrders;
};
