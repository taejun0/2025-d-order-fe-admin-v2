import styled from "styled-components";
import { IMAGE_CONSTANTS } from "@constants/imageConstants";
import TableBillItem from "./TableBillItem";
import { OrderItem, OrderStatus } from "@pages/liveorder_v2/types";

// 1. 부모 컴포넌트로부터 받을 props 타입을 정의합니다.
interface TableBillProps {
  orders: OrderItem[];
  onOrderStatusChange: (orderId: number, newStatus: OrderStatus) => void;
}

const TableBill = ({ orders, onOrderStatusChange }: TableBillProps) => {
  // 2. orders 배열이 비어있으면 아무것도 렌더링하지 않습니다.
  if (!orders || orders.length === 0) {
    return null;
  }

  // 3. 테이블 번호를 첫 번째 주문에서 가져옵니다.
  const tableNumber = `테이블 ${orders[0].table_num}`;

  // 1. 주문 목록을 시간순(오래된 순)으로 먼저 정렬합니다.
  const sortedOrders = [...orders].sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  // 2. 정렬된 목록의 첫 번째 주문(가장 이른 주문) 시간을 가져옵니다.
  const earliestOrderTime = new Date(
    sortedOrders[0].created_at
  ).toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return (
    <TableBillWrapper>
      <TableBillContents>
        <TableBillHeader>
          <TableHeaderText>{tableNumber}</TableHeaderText>
          <TableHeaderText className="orderTime">
            {earliestOrderTime}
          </TableHeaderText>
        </TableBillHeader>

        <TableBillItemWrapper>
          <TableBillItem
            orderItems={sortedOrders}
            onOrderStatusChange={onOrderStatusChange}
          />
        </TableBillItemWrapper>
      </TableBillContents>
      <TableBillBottom src={IMAGE_CONSTANTS.BILL} />
    </TableBillWrapper>
  );
};

export default TableBill;
const TableBillWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
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
