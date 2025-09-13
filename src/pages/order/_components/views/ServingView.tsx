import OrderMenuList from "../menuList/OrderMenuList";
import OrderTableList from "../tableList/OrderTableList";
import { useOrdersData } from "../../hooks/useOrderData";

type ServingViewProps = ReturnType<typeof useOrdersData>;

const ServingView = (props: ServingViewProps) => {
  return (
    <>
      <OrderMenuList
        viewType="serving"
        orders={props.orders}
        onServeOrder={props.handleServeOrder}
        onRevertOrder={props.handleRevertOrder}
        isLoading={props.isLoading}
        onRefresh={props.fetchOrders}
        lastUpdateTime={props.lastUpdated}
      />
      {/* 수정 이유: OrderTableList에도 상태 변경 함수를 전달하여,
        영수증 뷰에서도 '서빙완료' 및 '되돌리기' 버튼이 동작하도록 합니다.
      */}
      <OrderTableList
        viewType="serving"
        tableOrders={props.tableOrders}
        getFadingStatus={props.getFadingTableBillStatus}
        getEarliestOrderTime={props.getEarliestOrderTime}
        onServeOrder={props.handleServeOrder}
        onRevertOrder={props.handleRevertOrder}
      />
    </>
  );
};

export default ServingView;
