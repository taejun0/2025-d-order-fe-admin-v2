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

    const getEarliest = (t: TableOrder) =>
      Math.min(...t.orders.map((o) => new Date(o.created_at).getTime()));

    // 완료(그리고 페이드 중이 아님)만 하단으로, 나머지는 생성시간 기준으로 정렬
    return tableOrders.sort((a, b) => {
      const aPriority = a.isCompleted && !a.isFadingOut ? 1 : 0;
      const bPriority = b.isCompleted && !b.isFadingOut ? 1 : 0;

      if (aPriority !== bPriority) return aPriority - bPriority;
      return getEarliest(a) - getEarliest(b);
    });
  }, [orders, completedTables, fadingOutTables]);
  return groupedOrders;
};
