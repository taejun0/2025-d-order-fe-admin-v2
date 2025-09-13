import * as S from "./TableBillItem.styled";
import { OrderItem } from "../../types/orderTypes";
// 수정 이유: 상태를 텍스트 대신 버튼으로 보여주기 위해 OrderStatusButton을 import합니다.
import OrderStatusButton from "../OrderStatusButton";

// 수정 이유: viewType과 핸들러를 props로 추가합니다.
interface TableBillItemProps {
  viewType: "kitchen" | "serving";
  item: OrderItem;
  onCookOrder?: (orderId: number) => void;
  onServeOrder?: (orderId: number) => void;
  onRevertOrder?: (orderId: number) => void;
}

const TableBillItem = ({
  viewType,
  item,
  onCookOrder,
  onServeOrder,
  onRevertOrder,
}: TableBillItemProps) => {
  return (
    <S.ItemWrapper>
      <S.MenuName>{item.menu}</S.MenuName>
      <S.Quantity>{item.quantity}</S.Quantity>
      {/* 수정 이유: 기존의 텍스트 상태 표시(S.Status) 대신,
        OrderStatusButton 컴포넌트를 사용하여 버튼으로 상태를 표시하고
        클릭 이벤트를 처리할 수 있도록 합니다.
      */}
      <S.Status>
        <OrderStatusButton
          viewType={viewType}
          order={item}
          onCook={() => onCookOrder?.(item.id)}
          onServe={() => onServeOrder?.(item.id)}
          onRevert={() => onRevertOrder?.(item.id)}
        />
      </S.Status>
    </S.ItemWrapper>
  );
};

export default TableBillItem;
