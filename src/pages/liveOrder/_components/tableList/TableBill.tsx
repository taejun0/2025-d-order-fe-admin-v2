import styled from 'styled-components';
import { IMAGE_CONSTANTS } from '@constants/imageConstants';

import TableBillItem from './TableBillItem';
//import { OrderItem } from "../../api/LiveOrderService";
import { OrderItem } from '../../dummy/DummyLiveOrderService';
interface TableBillProps {
  tableNumber: string;
  orderTime: string;
  orderItems: OrderItem[];
  onOrderStatusChange?: (tableIndex: string, menuIndex: number) => void;
  getFadingStatus: (id: number) => boolean;
}

const TableBill = ({
  tableNumber,
  orderTime,
  orderItems,
  onOrderStatusChange,
  getFadingStatus,
}: TableBillProps) => {
  // 주문 상태 변경 핸들러
  const handleOrderStatusChangeForBillItem = (
    tableId: string,
    menuIndex: number
  ) => {
    if (onOrderStatusChange) {
      try {
        onOrderStatusChange(tableId, menuIndex);
      } catch (error) {}
    }
  };

  return (
    <TableBillWrapper>
      <TableBillContents>
        {/* 테이블번호,테이블첫주문시간 */}
        <TableBillHeader>
          <TableHeaderText>{tableNumber}</TableHeaderText>
          <TableHeaderText className="orderTime">{orderTime}</TableHeaderText>
        </TableBillHeader>

        {/* 주문내역 컴포넌트*/}
        <TableBillItemWrapper>
          <TableBillItem
            orderItems={orderItems}
            onOrderStatusChange={handleOrderStatusChangeForBillItem}
            getFadingStatus={getFadingStatus}
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
