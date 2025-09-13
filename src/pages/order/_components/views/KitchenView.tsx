import OrderMenuList from "../menuList/OrderMenuList";
import OrderTableList from "../tableList/OrderTableList";
import { useOrdersData } from "../../hooks/useOrderData";

type KitchenViewProps = ReturnType<typeof useOrdersData>;

const KitchenView = (props: KitchenViewProps) => {
  return (
    <>
      <OrderMenuList
        viewType="kitchen"
        orders={props.orders}
        onCookOrder={props.handleCookOrder}
        isLoading={props.isLoading}
        onRefresh={props.fetchOrders}
        lastUpdateTime={props.lastUpdated}
      />
      {/* 수정 이유: OrderTableList에도 상태 변경 함수를 전달하여,
        영수증 뷰에서도 '조리완료' 버튼이 동작하도록 합니다.
      */}
      <OrderTableList
        viewType="kitchen"
        tableOrders={props.tableOrders}
        getFadingStatus={props.getFadingTableBillStatus}
        getEarliestOrderTime={props.getEarliestOrderTime}
        onCookOrder={props.handleCookOrder}
      />
    </>
  );
};

export default KitchenView;
