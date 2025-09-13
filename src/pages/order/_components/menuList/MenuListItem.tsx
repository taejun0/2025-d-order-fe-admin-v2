import * as S from './MenuListItem.styled';
import { OrderItem } from '../../types/orderTypes';
import OrderStatusButton from '../OrderStatusButton';

interface MenuListItemProps {
  viewType: 'kitchen' | 'serving';
  order: OrderItem;
  onCook?: (orderId: number) => void;
  onServe?: (orderId: number) => void;
  onRevert?: (orderId: number) => void;
}

const MenuListItem = ({ viewType, order, ...handlers }: MenuListItemProps) => {
  return (
    <S.MenuListItemWrapper $isServed={order.status === 'served'}>
      <S.MenuItemText flex={1}>{order.time}</S.MenuItemText>
      <S.MenuItemText flex={1}>{order.table}</S.MenuItemText>
      <S.MenuInfo flex={2}>
        {order.imageUrl && <S.MenuImage src={order.imageUrl} alt={order.menu} />}
        <span>{order.menu}</span>
      </S.MenuInfo>
      <S.MenuItemText flex={1}>{order.quantity}개</S.MenuItemText>
      <S.MenuStatus flex={1}>
        <OrderStatusButton
          viewType={viewType}
          order={order}
          onCook={() => handlers.onCook?.(order.id)}
          onServe={() => handlers.onServe?.(order.id)}
          onRevert={() => handlers.onRevert?.(order.id)}
        />
      </S.MenuStatus>
    </S.MenuListItemWrapper>
  );
};

export default MenuListItem;