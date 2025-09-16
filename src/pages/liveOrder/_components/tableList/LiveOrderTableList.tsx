import * as S from './LiveOrderTableList.styled';
import TableBill from './TableBill';

//import { OrderItem } from "../../api/LiveOrderService";
import { OrderItem } from '../../dummy/DummyLiveOrderService';
import { useCallback } from 'react';
import styled from 'styled-components';
import { useLiveOrdersData } from '@pages/liveOrder/hooks/useLiveOrdersData';

interface LiveOrderTableListProps {
  tableOrders: Record<string, OrderItem[]>; // 이미 그룹화된 주문을 받음
  onOrderStatusChange: (orderId: number) => void; // orderId를 받도록 변경
  isLoading?: boolean;
  getFadingStatus: (tableName: string) => boolean; // 추가된 prop: 특정 테이블의 페이드 상태
  getEarliestOrderTime: (orders: OrderItem[]) => string; // 추가된 prop: 테이블별 가장 빠른 주문 시간 계산 함수
  getFadingMenuItemStatus: (orderId: number) => boolean;
}

// 페이드아웃 애니메이션을 위한 스타일드 컴포넌트
const FadeoutTable = styled.div<{ $isFading: boolean }>`
  opacity: ${({ $isFading }) => ($isFading ? 0 : 1)};
  transform: ${({ $isFading }) =>
    $isFading ? 'translateY(20px)' : 'translateY(0)'};
  transition: opacity 1.8s ease, transform 1.8s ease;
  width: 100%;
  margin-bottom: 20px;
`;

const LiveOrderTableList = ({
  tableOrders,
  onOrderStatusChange,
  isLoading = false,
  getFadingStatus, // 새 prop
  getEarliestOrderTime, // 새 prop
  getFadingMenuItemStatus,
}: LiveOrderTableListProps) => {
  // 주문 상태 변경 핸들러 (TableBillItem에서 호출됨)
  const handleOrderStatusChangeForTableBill = useCallback(
    async (tableId: string, menuIndex: number) => {
      const orderToUpdate = tableOrders[tableId]?.[menuIndex];
      if (orderToUpdate && orderToUpdate.id && !orderToUpdate.isServed) {
        onOrderStatusChange(orderToUpdate.id); // 중앙 핸들러 호출
      }
    },
    [tableOrders, onOrderStatusChange]
  );

  return (
    <S.TableListWrapper>
      <S.TableListContents>
        {isLoading && Object.keys(tableOrders).length === 0 ? (
          <S.NonOrderText>테이블 데이터를 불러오는 중...</S.NonOrderText>
        ) : Object.keys(tableOrders).length === 0 ? (
          <S.NonOrderText>현재 주문 중인 테이블이 없습니다.</S.NonOrderText>
        ) : (
          Object.entries(tableOrders).map(([tableName, tableItems]) => {
            // prop으로 받은 페이드 상태 사용
            const isFading = getFadingStatus(tableName);

            return (
              <FadeoutTable
                key={tableName}
                $isFading={isFading} // 여기에서 $isFading prop 사용
              >
                <TableBill
                  tableNumber={tableName}
                  orderTime={getEarliestOrderTime(tableItems)}
                  orderItems={tableItems}
                  onOrderStatusChange={handleOrderStatusChangeForTableBill}
                  getFadingStatus={getFadingMenuItemStatus}
                />
              </FadeoutTable>
            );
          })
        )}
      </S.TableListContents>
    </S.TableListWrapper>
  );
};

export default LiveOrderTableList;
