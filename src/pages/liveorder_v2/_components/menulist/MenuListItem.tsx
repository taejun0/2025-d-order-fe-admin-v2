import styled from "styled-components";
import OrderStateBtn from "../OrderStateBtn";
import { IMAGE_CONSTANTS } from "@constants/imageConstants";

import { OrderItem, OrderStatus } from "@pages/liveorder_v2/types";
// OrderItem과 OrderStatus 타입을 가져옵니다.

interface MenuListItemProps {
  order: OrderItem;
  onStatusChange: (orderId: number, newStatus: OrderStatus) => void;
}

const MenuListItem = ({ order, onStatusChange }: MenuListItemProps) => {
  const time = new Date(order.created_at).toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const table = `테이블${order.table_num}`;

  return (
    <Wrapper $isFading={order.isFadingOut}>
      <MenuImg>
        {order.menu_image ? (
          <MenuImage src={order.menu_image} alt={order.menu_name} />
        ) : (
          <DefaultOrderImage>
            <img src={IMAGE_CONSTANTS.CHARACTER} alt="기본 아코 이미지" />
          </DefaultOrderImage>
        )}
      </MenuImg>
      <MenuItemText>{time}</MenuItemText>
      <MenuItemText>{table}</MenuItemText>
      <MenuItemText style={{ flex: 2 }}>
        <LEE>
          <SET>세트</SET>
          <TEXT>{order.menu_name}</TEXT>
        </LEE>
      </MenuItemText>
      <MenuItemText>{order.menu_num}개</MenuItemText>
      <MenuItemText>
        {/* 4. OrderStateBtn에 동적인 데이터를 props로 전달합니다. */}
        <OrderStateBtn
          status={order.status}
          onStatusChange={(newStatus) => onStatusChange(order.id, newStatus)}
        />
      </MenuItemText>
    </Wrapper>
  );
};

export default MenuListItem;

const Wrapper = styled.div<{ $isFading?: boolean }>`
  display: flex;
  align-items: center;
  width: 100%;
  height: 70px;
  flex-shrink: 0;
  border-bottom: 1.5px dashed rgba(16, 16, 16, 0.3); // CSS 점선

  //페이드아웃 애니메이션
  transition: opacity 0.5s ease, transform 0.5s ease;
  opacity: ${({ $isFading }) => ($isFading ? 0 : 1)};
  transform: ${({ $isFading }) => ($isFading ? "scale(0.95)" : "scale(1)")};
`;

const MenuImg = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.Bg};
  border-radius: 5px;
  width: 50px;
  height: 50px;
  margin: 0 10px;
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
const MenuImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const MenuItemText = styled.div`
  display: flex;
  flex: 1;
  justify-content: center;

  color: ${({ theme }) => theme.colors.Black01};
  ${({ theme }) => theme.fonts.Bold14}
`;

const LEE = styled.div`
  display: flex;
  gap: 6px;
  justify-content: center;
  padding-left: 10px;

  width: 100%;
`;
const TEXT = styled.div`
  color: ${({ theme }) => theme.colors.Black01};
  ${({ theme }) => theme.fonts.Bold14}

  max-width: 112px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;
const SET = styled.div`
  display: flex;
  justify-content: center;
  width: 26px;
  height: 14px;
  flex-shrink: 0;
  border-radius: 3px;
  background: var(--Main-Orange-Orange01, #ff6e3f);
  color: var(--White-White01, #ffffff);
  ${({ theme }) => theme.fonts.SemiBold10}
`;
