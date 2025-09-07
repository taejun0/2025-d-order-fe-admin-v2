import styled from "styled-components";
import OrderStateBtn from "../OrderStateBtn";
import { IMAGE_CONSTANTS } from "@constants/imageConstants";
import { OrderItem, OrderStatus } from "@pages/liveorder_v2/types"; // types.ts에서 타입 가져오기

interface TableBillItemProps {
  orderItems: OrderItem[];
  onOrderStatusChange: (orderId: number, newStatus: OrderStatus) => void;
}

const TableBillItem = ({
  orderItems,
  onOrderStatusChange,
}: TableBillItemProps) => {
  // 1. 상태 변경 핸들러를 단순화합니다.
  // 버튼에서 newStatus를 받으면, 현재 순회 중인 order의 id와 함께 부모에게 전달합니다.
  const handleStatusChange = (newStatus: OrderStatus, order: OrderItem) => {
    onOrderStatusChange(order.id, newStatus);
  };

  return (
    <>
      {orderItems.map((order) => (
        <Wrapper key={order.id}>
          <OrderInfo>
            <OrderImg>
              {order.menu_image ? (
                <OrderImage src={order.menu_image} alt={order.menu_name} />
              ) : (
                <DefaultOrderImage>
                  <img src={IMAGE_CONSTANTS.CHARACTER} alt="기본 아코 이미지" />
                </DefaultOrderImage>
              )}
            </OrderImg>
            <OrderTextWrapper>
              <OrderText>{order.menu_name}</OrderText>
              <OrderText className="orderNum">수량: {order.menu_num}</OrderText>
            </OrderTextWrapper>
          </OrderInfo>
          <OrderStateBtn
            status={order.status}
            isBill={true}
            onStatusChange={(newStatus) => handleStatusChange(newStatus, order)}
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
    $isFading ? "translateY(10px)" : "translateY(0)"};
  transition: opacity 1.8s ease, transform 1.8s ease;
`;

const OrderInfo = styled.div`
  display: flex;
  gap: 10px;

  flex: 1; /* 이미지를 제외한 남은 공간 차지 */
  min-width: 0;
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

  flex: 1; /* 이미지를 제외한 남은 공간 차지 */
  min-width: 0;
`;

const OrderText = styled.div`
  color: ${({ theme }) => theme.colors.Black01};
  ${({ theme }) => theme.fonts.SemiBold12};

  &.orderNum {
    color: #2a2a2a;
    opacity: 0.6;
    ${({ theme }) => theme.fonts.SemiBold10};
  }

  //말줄임
  max-width: 112px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;
