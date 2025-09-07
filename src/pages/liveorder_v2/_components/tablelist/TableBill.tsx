import styled from "styled-components";
import { IMAGE_CONSTANTS } from "@constants/imageConstants";
import TableBillItem from "./TableBillItem";
import { OrderItem, OrderStatus } from "@pages/liveorder_v2/types";
import { useMemo } from "react";
const ORDER_DELETE_TIME = 1 * 10 * 1000;

// 1. 부모 컴포넌트로부터 받을 props 타입을 정의합니다.
interface TableBillProps {
  orders: OrderItem[];
  onOrderStatusChange: (orderId: number, newStatus: OrderStatus) => void;
  isFadingOut?: boolean;
  currentTime: number;
}

const TableBill = ({
  orders,
  onOrderStatusChange,
  isFadingOut,
  currentTime,
}: TableBillProps) => {
  // 1. useMemo를 사용해 보여줄 아이템 목록을 계산
  const visibleItems = useMemo(() => {
    // 3분 규칙으로 아이템 필터링
    const timeFiltered = orders.filter((order) => {
      if (order.status !== "SERVED") return true;
      if (order.servedAt && currentTime - order.servedAt < ORDER_DELETE_TIME) {
        return true;
      }
      return false;
    });
    // 시간순으로 정렬
    return timeFiltered.sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
  }, [orders, currentTime]);
  // 보여줄 아이템이 하나도 없으면 렌더링하지 않음 (이 경우는 거의 없음)
  if (visibleItems.length === 0) {
    return null;
  }

  const tableNumber = `테이블 ${visibleItems[0].table_num}`;

  // 가장 이른 주문 시간 계산
  const earliestOrderTime = new Date(
    visibleItems[0].created_at
  ).toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

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
            // 2. 필터링되고 정렬된 목록을 전달
            orderItems={visibleItems}
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
