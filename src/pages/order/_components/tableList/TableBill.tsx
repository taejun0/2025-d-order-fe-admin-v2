import * as S from "./TableBill.styled";
import { OrderItem } from "../../types/orderTypes";
import TableBillItem from "./TableBillItem";

// 수정 이유: viewType과 핸들러를 props로 추가합니다.
interface TableBillProps {
  viewType: "kitchen" | "serving";
  tableNumber: string;
  orderTime: string;
  orderItems: OrderItem[];
  onCookOrder?: (orderId: number) => void;
  onServeOrder?: (orderId: number) => void;
  onRevertOrder?: (orderId: number) => void;
}

const TableBill = ({
  viewType,
  tableNumber,
  orderTime,
  orderItems,
  onCookOrder,
  onServeOrder,
  onRevertOrder,
}: TableBillProps) => {
  return (
    <S.BillWrapper>
      <S.BillHeader>
        <S.TableNumber>{tableNumber}</S.TableNumber>
        <S.OrderTime>첫 주문: {orderTime}</S.OrderTime>
      </S.BillHeader>
      <S.BillBody>
        <S.BillCategory>
          <span>메뉴</span>
          <span>수량</span>
          <span>상태</span>
        </S.BillCategory>
        {orderItems.map((item) => (
          // 수정 이유: TableBillItem에 viewType과 핸들러를 전달합니다.
          <TableBillItem
            key={item.id}
            viewType={viewType}
            item={item}
            onCookOrder={onCookOrder}
            onServeOrder={onServeOrder}
            onRevertOrder={onRevertOrder}
          />
        ))}
      </S.BillBody>
    </S.BillWrapper>
  );
};

export default TableBill;
