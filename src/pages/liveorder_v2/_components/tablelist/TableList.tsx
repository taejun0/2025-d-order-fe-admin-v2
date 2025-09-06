// src/components/tablelist/TableList.tsx

import * as S from "./TableList.styled";
import TableBill from "./TableBill";
import { useEffect } from "react";
import { useLiveOrderStore } from "@pages/liveorder_v2/LiveOrderStore";
import { OrderItem } from "@pages/liveorder_v2/types";

const TableList = () => {
  const { orders, fetchOrders, changeOrderStatus } = useLiveOrderStore();

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // 1. 주문 데이터를 테이블 번호(table_num)를 기준으로 그룹핑합니다.
  const groupedOrders = orders.reduce((acc, order) => {
    const tableNum = order.table_num;
    // acc(누적객체)에 해당 테이블 번호가 없으면 빈 배열로 초기화합니다.
    if (!acc[tableNum]) {
      acc[tableNum] = [];
    }
    // 현재 주문을 해당 테이블 번호의 배열에 추가합니다.
    acc[tableNum].push(order);
    return acc;
  }, {} as Record<number, OrderItem[]>); // 결과 타입: { 2: OrderItem[], 5: OrderItem[] }

  const sortedTableGroups = Object.values(groupedOrders).sort(
    (groupA, groupB) => {
      // 각 그룹에서 가장 이른 주문 시간을 찾습니다.
      const earliestTimeA = Math.min(
        ...groupA.map((order) => new Date(order.created_at).getTime())
      );
      const earliestTimeB = Math.min(
        ...groupB.map((order) => new Date(order.created_at).getTime())
      );

      // 시간순(오름차순)으로 그룹을 정렬합니다.
      return earliestTimeA - earliestTimeB;
    }
  );

  return (
    <S.TableListWrapper>
      <S.TableListContainer>
        {sortedTableGroups.map((tableOrders) => (
          <TableBill
            key={tableOrders[0].table_num} // key를 테이블 번호로 변경하여 안정성 향상
            orders={tableOrders}
            onOrderStatusChange={changeOrderStatus}
          />
        ))}
      </S.TableListContainer>
    </S.TableListWrapper>
  );
};

export default TableList;
