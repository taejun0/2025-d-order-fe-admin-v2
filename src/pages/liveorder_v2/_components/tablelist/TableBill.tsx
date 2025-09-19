import styled from "styled-components";
import { IMAGE_CONSTANTS } from "@constants/imageConstants";
import TableBillItem from "./TableBillItem";
import { OrderItem, OrderStatus } from "@pages/liveorder_v2/types";
// import { useMemo } from "react";
// import { ORDER_DELETE_TIME } from "@constants/timeConstant";

interface TableBillProps {
  orders: OrderItem[];
  onOrderStatusChange: (orderId: number, newStatus: OrderStatus) => void;
  isFadingOut?: boolean;
  // currentTime: number;
}

const TableBill = ({
  orders,
  onOrderStatusChange,
  isFadingOut,
}: // currentTime,
TableBillProps) => {
  // 모든 주문이 served면 컴포넌트 렌더링하지 않음
  const isFullyServed = orders.every((order) => order.status === "served");
  if (isFullyServed) return null;

  // 시간순 정렬
  const sortedItems = [...orders].sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  const singleOrder = sortedItems[0];
  const tableNumber = `테이블 ${singleOrder.table_num}`;
  const earliestOrderTime = new Date(singleOrder.created_at).toLocaleTimeString(
    "ko-KR",
    {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }
  );

  return (
    <TableBillWrapper $isFading={isFadingOut}>
      <TableBillContents>
        <TableBillHeader>
          <TableHeaderText>{tableNumber}</TableHeaderText>
          <TableHeaderText className="orderTime">
            {earliestOrderTime}
          </TableHeaderText>
        </TableBillHeader>

        <TableBillItemWrapper>
          <TableBillItem
            orderItems={sortedItems}
            onOrderStatusChange={onOrderStatusChange}
          />
        </TableBillItemWrapper>
      </TableBillContents>
      <TableBillBottom src={IMAGE_CONSTANTS.BILL} />
    </TableBillWrapper>
  );
};

export default TableBill;

const TableBillWrapper = styled.div<{ $isFading?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;

  //페이드아웃 애니메이션
  transition: opacity 0.5s ease, transform 0.5s ease;
  opacity: ${({ $isFading }) => ($isFading ? 0 : 1)};
  transform: ${({ $isFading }) => ($isFading ? "scale(0.95)" : "scale(1)")};
`;

const TableBillContents = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  min-height: 190px;
  padding: 17px;
  box-sizing: border-box;

  background-color: ${({ theme }) => theme.colors.Bg};

  /* 상단 모서리만 둥글게 */
  border-radius: 13px 13px 0 0;

  /* 이미지와 겹치는 부분 처리 */
  position: relative;
  z-index: 1;
`;

const TableBillBottom = styled.img`
  display: block;
  width: 100%;
  margin-top: -5px; /* 겹치는 부분 조정 */
  position: relative;
  z-index: 0;
`;

const TableBillHeader = styled.div`
  display: flex;
  width: 100%;
  height: 27px;
  justify-content: space-between;

  border-bottom: 1px solid;
  border-color: rgba(192, 192, 192, 0.5);
`;

const TableHeaderText = styled.div`
  color: ${({ theme }) => theme.colors.Black};
  ${({ theme }) => theme.fonts.Bold14};

  &.orderTime {
    color: ${({ theme }) => theme.colors.Focused};
    ${({ theme }) => theme.fonts.SemiBold14};
  }
`;

const TableBillItemWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;

  gap: 17px;
  padding-top: 17px;
`;
