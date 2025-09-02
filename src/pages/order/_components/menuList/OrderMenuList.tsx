import * as S from './OrderMenuList.styled';
import { OrderItem } from '../../types/orderTypes';
import MenuListItem from './MenuListItem';
import { IMAGE_CONSTANTS } from '@constants/imageConstants';
import styled from 'styled-components';

interface OrderMenuListProps {
  viewType: 'kitchen' | 'serving';
  orders: OrderItem[];
  isLoading?: boolean;
  onRefresh?: () => void;
  lastUpdateTime?: string;
  onCookOrder?: (orderId: number) => void;
  onServeOrder?: (orderId: number) => void;
  onRevertOrder?: (orderId: number) => void;
}

const AnimatedItem = styled.div<{ $isServed: boolean }>`
  transition: all 0.5s ease-in-out, opacity 0.5s ease-in-out;
  width: 100%;
  order: ${({ $isServed }) => ($isServed ? 1 : 0)};
  opacity: ${({ $isServed }) => ($isServed ? 0.7 : 1)};
`;

// 수정 이유: ...props 전개 구문을 사용하면 불필요한 props(e.g. onCookOrder)가
// DOM 요소로 전달될 수 있어 React 경고가 발생합니다. 필요한 props만 명시적으로 받아 전달하도록 수정합니다.
const OrderMenuList = ({
  viewType,
  orders,
  isLoading,
  onRefresh,
  lastUpdateTime,
  onCookOrder,
  onServeOrder,
  onRevertOrder
}: OrderMenuListProps) => {
  const categories = ["주문시각", "테이블", "메뉴", "수량", "상태"];

  return (
    <S.LiveOrderMenuList>
        <S.LiveOrderMenuListHeader>
            <div>
                <S.HeaderTitle>실시간 주문</S.HeaderTitle>
                {lastUpdateTime && <S.LastUpdateTime>마지막 갱신: {lastUpdateTime}</S.LastUpdateTime>}
            </div>
            <S.HeaderReloadButton onClick={onRefresh}>
                <img src={IMAGE_CONSTANTS.RELOADWHITE} alt="reloadWhite" /> 최신 주문 확인
            </S.HeaderReloadButton>
        </S.LiveOrderMenuListHeader>
        <S.MenuListCategory>
            {categories.map((label, index) => <S.MenuListCategoryText key={index} style={{flex: [1,1,2,1,1][index]}}>{label}</S.MenuListCategoryText>)}
        </S.MenuListCategory>
        <S.ScrollableMenuContainer>
            {isLoading && orders.length === 0 ? <S.NonOrderText>주문 데이터를 불러오는 중...</S.NonOrderText> :
             orders.length === 0 ? <S.NonOrderText>주문 내역이 없습니다.</S.NonOrderText> :
             orders.map(order => (
                <AnimatedItem key={order.id} $isServed={order.status === 'served'}>
                    <MenuListItem
                        viewType={viewType}
                        order={order}
                        onCook={onCookOrder}
                        onServe={onServeOrder}
                        onRevert={onRevertOrder}
                    />
                </AnimatedItem>
             ))
            }
        </S.ScrollableMenuContainer>
    </S.LiveOrderMenuList>
  );
};

export default OrderMenuList;