import * as S from "./OrderTableList.styled";
import TableBill from "./TableBill";
import { OrderItem } from "../../types/orderTypes";
import styled from "styled-components";

// 수정 이유: viewType과 핸들러 함수들을 props로 추가합니다.
interface OrderTableListProps {
  viewType: "kitchen" | "serving";
  tableOrders: Record<string, OrderItem[]>;
  getFadingStatus: (tableName: string) => boolean;
  getEarliestOrderTime: (orders: OrderItem[]) => string;
  onCookOrder?: (orderId: number) => void;
  onServeOrder?: (orderId: number) => void;
  onRevertOrder?: (orderId: number) => void;
}

const FadeoutTable = styled.div<{ $isFading: boolean }>`
  opacity: ${({ $isFading }) => ($isFading ? 0 : 1)};
  transform: ${({ $isFading }) =>
    $isFading ? "translateY(20px)" : "translateY(0)"};
  transition: opacity 1.8s ease, transform 1.8s ease;
  width: 100%;
  margin-bottom: 20px;
`;

const OrderTableList = ({
  viewType,
  tableOrders,
  getFadingStatus,
  getEarliestOrderTime,
  onCookOrder,
  onServeOrder,
  onRevertOrder,
}: OrderTableListProps) => {
  const sortedTableNames = Object.keys(tableOrders).sort((a, b) => {
    const tableNumA = parseInt(a.replace("테이블 ", ""), 10);
    const tableNumB = parseInt(b.replace("테이블 ", ""), 10);
    return tableNumA - tableNumB;
  });

  return (
    <S.TableListWrapper>
      <S.TableListContents>
        {Object.keys(tableOrders).length === 0 ? (
          <S.NonOrderText>현재 주문 중인 테이블이 없습니다.</S.NonOrderText>
        ) : (
          sortedTableNames.map((tableName) => {
            const tableItems = tableOrders[tableName];
            const isFading = getFadingStatus(tableName);
            return (
              <FadeoutTable key={tableName} $isFading={isFading}>
                {/* 수정 이유: TableBill에 viewType과 핸들러를 전달합니다. */}
                <TableBill
                  viewType={viewType}
                  tableNumber={tableName}
                  orderTime={getEarliestOrderTime(tableItems)}
                  orderItems={tableItems}
                  onCookOrder={onCookOrder}
                  onServeOrder={onServeOrder}
                  onRevertOrder={onRevertOrder}
                />
              </FadeoutTable>
            );
          })
        )}
      </S.TableListContents>
    </S.TableListWrapper>
  );
};

export default OrderTableList;
