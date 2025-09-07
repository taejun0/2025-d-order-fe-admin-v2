// src/hooks/useGroupedAndSortedOrders.ts

import { useMemo } from "react";
import { OrderItem } from "@pages/liveorder_v2/types";

const ORDER_DELETE_TIME = 1 * 10 * 1000;

// 주문 데이터를 받아 테이블별로 그룹핑하고, 가장 오래된 주문 순서로 테이블을 정렬하는 훅
export const useGroupedAndSortedOrders = (
  orders: OrderItem[],
  currentTime: number // 👈 currentTime을 인자로 받음
) => {
  const sortedTableGroups = useMemo(() => {
    if (!orders || orders.length === 0) {
      return [];
    }

    // 1. 테이블별로 주문 그룹핑
    const groupedOrders = orders.reduce((acc, order) => {
      const tableNum = order.table_num;
      if (!acc[tableNum]) {
        acc[tableNum] = [];
      }
      acc[tableNum].push(order);
      return acc;
    }, {} as Record<number, OrderItem[]>);

    // 2. 3분 지난 완료 테이블을 목록에서 완전히 제거 (👇 여기가 핵심!)
    const filteredGroups = Object.values(groupedOrders).filter(
      (tableOrders) => {
        // 테이블의 모든 주문이 SERVED 상태인지 확인
        const isFullyServed = tableOrders.every(
          (order) => order.status === "SERVED"
        );

        // 만약 모든 주문이 서빙 완료가 아니라면, 무조건 목록에 포함
        if (!isFullyServed) return true;

        // 모든 주문이 서빙 완료 상태일 경우, 가장 마지막에 서빙된 주문 시간을 찾음
        const lastServedTime = Math.max(
          ...tableOrders.map((order) => order.servedAt || 0)
        );

        // 마지막 주문이 서빙된 지 3분이 지났으면 false를 반환하여 테이블 그룹 전체를 제거
        return currentTime - lastServedTime < ORDER_DELETE_TIME;
      }
    );

    // 3. 남은 테이블들을 정렬 (완료된 테이블은 아래로)
    const sortedGroups = filteredGroups.sort((groupA, groupB) => {
      const aIsCompleted = groupA.every((order) => order.status === "SERVED");
      const bIsCompleted = groupB.every((order) => order.status === "SERVED");

      if (aIsCompleted && !bIsCompleted) return 1;
      if (!aIsCompleted && bIsCompleted) return -1;

      const earliestTimeA = Math.min(
        ...groupA.map((order) => new Date(order.created_at).getTime())
      );
      const earliestTimeB = Math.min(
        ...groupB.map((order) => new Date(order.created_at).getTime())
      );
      return earliestTimeA - earliestTimeB;
    });

    return sortedGroups;
  }, [orders, currentTime]); // currentTime을 의존성 배열에 추가

  return sortedTableGroups;
};
