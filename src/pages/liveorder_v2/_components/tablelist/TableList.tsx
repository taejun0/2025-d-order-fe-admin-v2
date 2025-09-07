// src/components/tablelist/TableList.tsx

import * as S from "./TableList.styled";
import TableBill from "./TableBill";
import { useEffect } from "react";
import { useLiveOrderStore } from "@pages/liveorder_v2/LiveOrderStore";

import { useGroupedAndSortedOrders } from "../../hooks/useGroupedAndSortedOrders";
import { useCurrentTime } from "../../hooks/useCurrentTime";
const TableList = () => {
  // 1. 스토어에서 필요한 상태와 새로운 애니메이션 액션을 가져옵니다.
  const {
    orders,
    fetchOrders,
    updateOrderStatusWithAnimation,
    fadingOutTables,
  } = useLiveOrderStore();

  // 1. 1분마다 업데이트되는 현재 시간을 가져옴
  const currentTime = useCurrentTime(10000);

  // 2. 커스텀 훅을 사용하여 복잡한 데이터 처리 로직을 단 한 줄로 대체합니다.
  const sortedTableGroups = useGroupedAndSortedOrders(orders, currentTime);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return (
    <S.TableListWrapper>
      <S.TableListContainer>
        {sortedTableGroups.map((tableOrders) => {
          const tableNum = tableOrders[0].table_num;
          return (
            <TableBill
              key={tableNum}
              orders={tableOrders}
              onOrderStatusChange={updateOrderStatusWithAnimation}
              // 👈 fadingOutTables Set에 현재 테이블 번호가 있는지 확인하여 prop 전달
              isFadingOut={fadingOutTables.has(tableNum)}
              currentTime={currentTime}
            />
          );
        })}
      </S.TableListContainer>
    </S.TableListWrapper>
  );
};

export default TableList;
