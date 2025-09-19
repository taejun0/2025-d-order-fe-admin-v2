// src/pages/liveorder_v2/_components/tablelist/TableList.tsx

import * as S from "./TableList.styled";
import TableBill from "./TableBill";
import { useLiveOrderStore } from "@pages/liveorder_v2/LiveOrderStore";
import { useGroupedAndSortedOrders } from "../../hooks/useGroupedAndSortedOrders";

const TableList = () => {
  const { orders, updateOrderStatusWithAnimation, fadingOutTables } =
    useLiveOrderStore();

  // 훅에서 이제 테이블별로 그룹핑된 주문 목록을 반환
  const sortedTableGroups = useGroupedAndSortedOrders(orders);

  return (
    <S.TableListWrapper>
      <S.TableListContainer>
        {sortedTableGroups.map((tableOrders) => {
          const orderId = tableOrders[0].order_id;
          const earliestCreatedAt = tableOrders[0].created_at;
          const key = `${orderId}-${earliestCreatedAt}`;
          // 그룹 내 첫 번째 주문의 ID와 테이블 번호를 사용
          // const firstOrder = tableOrders[0];
          // const tableNum = firstOrder.table_num;
          // const key = `${tableNum}-${firstOrder.created_at}`;

          return (
            <TableBill
              key={key}
              orders={tableOrders}
              onOrderStatusChange={updateOrderStatusWithAnimation}
              // isFadingOut={fadingOutTables.has(tableNum)}
              isFadingOut={fadingOutTables.has(orderId)}
              // currentTime={currentTime}
            />
          );
        })}
      </S.TableListContainer>
    </S.TableListWrapper>
  );
};

export default TableList;
