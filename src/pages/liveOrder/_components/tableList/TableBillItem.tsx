import styled from 'styled-components';
import OrderStateBtn from '../OrderStateBtn';
//import { OrderItem } from "../../api/LiveOrderService";
import { OrderItem } from '../../dummy/DummyLiveOrderService';
import { IMAGE_CONSTANTS } from '@constants/imageConstants';

interface TableBillItemProps {
  orderItems: OrderItem[];
  onOrderStatusChange?: (tableIndex: string, menuIndex: number) => void;
  getFadingStatus?: (id: number) => boolean;
}

const TableBillItem = ({
  orderItems,
  onOrderStatusChange,
  getFadingStatus,
}: TableBillItemProps) => {
  // 주문 상태 업데이트 핸들러
  const handleServeClick = (item: OrderItem, index: number) => {
    if (!onOrderStatusChange) return;

    try {
      // 상위 컴포넌트로 변경 사항 전달
      onOrderStatusChange(item.table, index);
    } catch (error) {}
  };

  return (
    <>
      {orderItems.map((order, index) => (
        <Wrapper
          key={order.id || index}
          $isFading={getFadingStatus?.(order.id)}
        >
          <OrderInfo>
            <OrderImg>
              {order.imageUrl ? (
                <OrderImage src={order.imageUrl} alt={order.menu} />
              ) : (
                <DefaultOrderImage>
                  <img src={IMAGE_CONSTANTS.CHARACTER} alt="기본아코이미지" />
                </DefaultOrderImage>
              )}
            </OrderImg>
            <OrderTextWrapper>
              <OrderText>{order.menu}</OrderText>
              <OrderText className="orderNum">수량: {order.quantity}</OrderText>
            </OrderTextWrapper>
          </OrderInfo>
          <OrderStateBtn
            isChecked={order.isServed}
            isBill={true}
            onClick={() => !order.isServed && handleServeClick(order, index)}
          />
        </Wrapper>
      ))}
    </>
  );
};

export default TableBillItem;

const Wrapper = styled.div<{ $isFading?: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 44px;

  padding-bottom: 10px;
  box-sizing: border-box;
  border-bottom: 1.5px dashed rgba(16, 16, 16, 0.3);

  opacity: ${({ $isFading }) => ($isFading ? 0 : 1)};
  transform: ${({ $isFading }) =>
    $isFading ? 'translateY(10px)' : 'translateY(0)'};
  transition: opacity 1.8s ease, transform 1.8s ease;
`;

const OrderInfo = styled.div`
  display: flex;
  gap: 10px;
`;

const OrderImg = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 34px;
  height: 34px;
  border-radius: 3.4px;
  background-color: ${({ theme }) => theme.colors.Gray01};
  overflow: hidden;
`;

const DefaultOrderImage = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;

  & img {
    width: 80%;
    height: auto;
  }
`;

const OrderImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const OrderTextWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const OrderText = styled.div`
  color: ${({ theme }) => theme.colors.Black01};
  ${({ theme }) => theme.fonts.SemiBold12};

  &.orderNum {
    color: #2a2a2a;
    opacity: 0.6;

    ${({ theme }) => theme.fonts.SemiBold10};
  }

  white-space: nowrap;
`;
