// // src/pages/liveorder_v2/hooks/useGroupedAndSortedOrders.ts

import { useMemo } from "react";
import { OrderItem } from "@pages/liveorder_v2/types";
import { useLiveOrderStore } from "@pages/liveorder_v2/LiveOrderStore";
// 주문 데이터를 order_id 기준으로 그룹핑하고, 시간순 정렬
export const useGroupedAndSortedOrders = (orders: OrderItem[]) => {
  const { fadingOutTables } = useLiveOrderStore();

  const sortedTableGroups = useMemo(() => {
    if (!orders || orders.length === 0) {
      return [];
    }

    // 1. order_id 기준으로 그룹핑
    const groupedOrders = orders.reduce((acc, order) => {
      const groupKey = order.order_id.toString();
      if (!acc[groupKey]) {
        acc[groupKey] = [];
      }
      acc[groupKey].push(order);
      return acc;
    }, {} as Record<string, OrderItem[]>);
    // 2. 모든 주문이 served인 그룹은 목록에서 제외 (단, fadingOutTables에 있으면 유지)
    const filteredGroups = Object.values(groupedOrders).filter(
      (group) =>
        !group.every((order) => order.status === "served") ||
        fadingOutTables.has(group[0].order_id)
    );

    // 3. 그룹을 주문 생성 시간(created_at) 기준으로 정렬
    const sortedGroups = filteredGroups.sort((groupA, groupB) => {
      const earliestTimeA = new Date(groupA[0].created_at).getTime();
      const earliestTimeB = new Date(groupB[0].created_at).getTime();
      return earliestTimeA - earliestTimeB;
    });

    return sortedGroups;
  }, [orders, fadingOutTables]);

  return sortedTableGroups;
};
