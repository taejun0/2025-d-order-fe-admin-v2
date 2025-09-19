// // src/pages/liveorder_v2/hooks/useGroupedAndSortedOrders.ts

import { useMemo } from "react";
import { OrderItem } from "@pages/liveorder_v2/types";

// 주문 데이터를 order_id 기준으로 그룹핑하고, 시간순 정렬
export const useGroupedAndSortedOrders = (orders: OrderItem[]) => {
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

    // 2. 그룹 중 모든 주문이 서빙완료면 목록에서 제거
    const filteredGroups = Object.values(groupedOrders).filter(
      (group) => !group.every((order) => order.status === "served")
    );

    // 3. 그룹을 주문 생성 시간(created_at) 기준으로 정렬
    const sortedGroups = filteredGroups.sort((groupA, groupB) => {
      const earliestTimeA = new Date(groupA[0].created_at).getTime();
      const earliestTimeB = new Date(groupB[0].created_at).getTime();
      return earliestTimeA - earliestTimeB;
    });

    return sortedGroups;
  }, [orders]);

  return sortedTableGroups;
};
