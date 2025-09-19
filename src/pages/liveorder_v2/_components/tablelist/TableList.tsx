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
