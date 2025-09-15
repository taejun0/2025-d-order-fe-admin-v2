import styled from "styled-components";
import { IMAGE_CONSTANTS } from "@constants/imageConstants";
import TableBillItem from "./TableBillItem";
import { OrderItem, OrderStatus } from "@pages/liveorder_v2/types";
import { useMemo } from "react";
const ORDER_DELETE_TIME = 1 * 10 * 1000;

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
  // TableList에서 이미 필터링/정렬된 단일 아이템 배열을 받으므로
  // 이 로직은 불필요하지만, 기존 코드의 호환성을 위해 유지
  const visibleItems = useMemo(() => {
    const timeFiltered = orders.filter((order) => {
      if (order.status !== "served") return true;
      if (order.servedAt && currentTime - order.servedAt < ORDER_DELETE_TIME) {
        return true;
      }
      return false;
    });

    return timeFiltered.sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
  }, [orders, currentTime]);

  if (visibleItems.length === 0) {
    return null;
  }

  // 이제 visibleItems 배열에는 단일 아이템만 들어있으므로, 첫 번째 항목을 사용
  const singleOrder = visibleItems[0];
  const tableNumber = `테이블 ${singleOrder.table_num}`;

  // 가장 이른 주문 시간 계산 (단일 주문의 시간)
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
