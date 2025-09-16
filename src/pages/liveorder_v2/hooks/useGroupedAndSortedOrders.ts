// src/pages/liveorder_v2/hooks/useGroupedAndSortedOrders.ts

import { useMemo } from "react";
import { OrderItem } from "@pages/liveorder_v2/types";
import { ORDER_DELETE_TIME } from "@constants/timeConstant";

// 주문 데이터를 받아 테이블 및 주문 시간별로 그룹핑하고, 정렬하는 훅
export const useGroupedAndSortedOrders = (
  orders: OrderItem[],
  currentTime: number
) => {
  const sortedTableGroups = useMemo(() => {
    if (!orders || orders.length === 0) {
      return [];
    }

    // 1. 테이블과 주문 시간(created_at)을 기준으로 주문 그룹핑
    const groupedOrders = orders.reduce((acc, order) => {
      // 그룹화 키 생성: 테이블 번호와 주문 생성 시간을 결합
      const groupKey = `${order.table_num}-${order.created_at}`;
      if (!acc[groupKey]) {
        acc[groupKey] = [];
      }
      acc[groupKey].push(order);
      return acc;
    }, {} as Record<string, OrderItem[]>);

    // 2. 3분 지난 완료된 그룹을 목록에서 완전히 제거
    const filteredGroups = Object.values(groupedOrders).filter(
      (tableOrders) => {
        // 그룹의 모든 주문이 served 상태인지 확인
        const isFullyServed = tableOrders.every(
          (order) => order.status === "served"
        );

        // 만약 모든 주문이 서빙 완료가 아니라면, 무조건 목록에 포함
        if (!isFullyServed) return true;

        // 모든 주문이 서빙 완료 상태일 경우, 가장 마지막에 서빙된 주문 시간을 찾음
        const lastServedTime = Math.max(
          ...tableOrders.map((order) => order.servedAt || 0)
        );

        // 마지막 주문이 서빙된 지 3분이 지났으면 false를 반환하여 그룹 전체를 제거
        return currentTime - lastServedTime < ORDER_DELETE_TIME;
      }
    );
    // 2. 백엔드에서 10분 후 사라지게 하므로, 필터링 로직을 제거
    //const filteredGroups = Object.values(groupedOrders); // 필터링 없이 모든 그룹을 포함
    // 3. 남은 그룹들을 정렬 (완료된 그룹은 아래로)
    const sortedGroups = filteredGroups.sort((groupA, groupB) => {
      const aIsCompleted = groupA.every((order) => order.status === "served");
      const bIsCompleted = groupB.every((order) => order.status === "served");

      // 완료된 그룹은 뒤로
      if (aIsCompleted && !bIsCompleted) return 1;
      if (!aIsCompleted && bIsCompleted) return -1;

      // 같은 상태 내에서는 가장 이른 주문 시간 순으로
      const earliestTimeA = new Date(groupA[0].created_at).getTime();
      const earliestTimeB = new Date(groupB[0].created_at).getTime();
      return earliestTimeA - earliestTimeB;
    });

    return sortedGroups;
  }, [orders, currentTime]);

  return sortedTableGroups;
};
