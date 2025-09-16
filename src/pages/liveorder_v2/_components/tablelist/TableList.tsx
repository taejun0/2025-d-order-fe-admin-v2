// src/pages/liveorder_v2/_components/tablelist/TableList.tsx

import * as S from "./TableList.styled";
import TableBill from "./TableBill";
import { useLiveOrderStore } from "@pages/liveorder_v2/LiveOrderStore";
import { useGroupedAndSortedOrders } from "../../hooks/useGroupedAndSortedOrders";
import { useCurrentTime } from "../../hooks/useCurrentTime";

const TableList = () => {
  const { orders, updateOrderStatusWithAnimation, fadingOutTables } =
    useLiveOrderStore();
  const currentTime = useCurrentTime(10000);

  // 훅에서 이제 테이블별로 그룹핑된 주문 목록을 반환
  const sortedTableGroups = useGroupedAndSortedOrders(orders, currentTime);

  return (
    <S.TableListWrapper>
      <S.TableListContainer>
        {sortedTableGroups.map((tableOrders) => {
          // 그룹 내 첫 번째 주문의 ID와 테이블 번호를 사용
          const firstOrder = tableOrders[0];
          const tableNum = firstOrder.table_num;
          const key = `${tableNum}-${firstOrder.created_at}`;

          return (
            <TableBill
              key={key}
              orders={tableOrders}
              onOrderStatusChange={updateOrderStatusWithAnimation}
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

// // src/components/tablelist/TableList.tsx

// import * as S from "./TableList.styled";
// import TableBill from "./TableBill";
// // import { useEffect } from "react";
// import { useLiveOrderStore } from "@pages/liveorder_v2/LiveOrderStore";

// import { useGroupedAndSortedOrders } from "../../hooks/useGroupedAndSortedOrders";
// import { useCurrentTime } from "../../hooks/useCurrentTime";
// const TableList = () => {
//   // 1. 스토어에서 필요한 상태와 새로운 애니메이션 액션을 가져옵니다.
//   const {
//     orders,

//     updateOrderStatusWithAnimation,
//     fadingOutTables,
//   } = useLiveOrderStore();

//   // 1. 1분마다 업데이트되는 현재 시간을 가져옴
//   const currentTime = useCurrentTime(10000);

//   // 2. 커스텀 훅을 사용하여 복잡한 데이터 처리 로직을 단 한 줄로 대체합니다.
//   const sortedTableGroups = useGroupedAndSortedOrders(orders, currentTime);

//   // useEffect(() => {
//   //   // 웹소켓이 데이터를 제공하므로 이 호출은 더 이상 필요 없음
//   // }, []);

//   return (
//     <S.TableListWrapper>
//       <S.TableListContainer>
//         {sortedTableGroups.map((tableOrders) => {
//           const tableNum = tableOrders[0].table_num;
//           return (
//             <TableBill
//               key={tableNum}
//               orders={tableOrders}
//               onOrderStatusChange={updateOrderStatusWithAnimation}
//               // 👈 fadingOutTables Set에 현재 테이블 번호가 있는지 확인하여 prop 전달
//               isFadingOut={fadingOutTables.has(tableNum)}
//               currentTime={currentTime}
//             />
//           );
//         })}
//       </S.TableListContainer>
//     </S.TableListWrapper>
//   );
// };

// export default TableList;
