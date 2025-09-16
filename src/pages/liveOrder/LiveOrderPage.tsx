import * as S from './LiveOrderPage.styled';
import LiveOrderMenuList from './_components/menuList/LiveOrderMenuList';
import LiveOrderTableList from './_components/tableList/LiveOrderTableList';

import { useLiveOrdersData } from './hooks/useLiveOrdersData'; // 새롭게 생성된 훅 임포트

const LiveOrderPage = () => {
  const {
    orders,
    tableOrders, // useLiveOrdersData 훅에서 테이블별로 그룹화된 주문 데이터를 받음
    isLoading,
    lastUpdated,
    fetchOrders,
    handleServeOrder,
    getFadingMenuItemStatus,
    getFadingTableBillStatus,
    getEarliestOrderTime,
  } = useLiveOrdersData();

  return (
    <S.LiveOrderPageWrapper>
      {isLoading &&
      orders.length === 0 &&
      Object.keys(tableOrders).length === 0 ? (
        // 초기 로딩 중이며 데이터가 없을 때만 "주문 데이터를 불러오는 중..." 표시
        <div>주문 데이터를 불러오는 중...</div>
      ) : (
        <>
          <LiveOrderMenuList
            orders={orders} // useLiveOrdersData에서 필터링된 주문 리스트
            onOrderStatusChange={handleServeOrder} // 중앙 주문 상태 변경 핸들러
            isLoading={isLoading}
            onRefresh={fetchOrders} // 중앙 새로고침 함수
            lastUpdateTime={lastUpdated}
            getFadingStatus={getFadingMenuItemStatus} // 개별 메뉴 항목의 페이드 상태를 얻는 함수
          />

          <LiveOrderTableList
            tableOrders={tableOrders} // useLiveOrdersData에서 그룹화되고 필터링된 테이블 주문
            onOrderStatusChange={handleServeOrder} // 동일한 중앙 주문 상태 변경 핸들러
            isLoading={isLoading}
            getFadingStatus={getFadingTableBillStatus} // 테이블의 페이드 상태를 얻는 함수
            getEarliestOrderTime={getEarliestOrderTime} // 테이블별 가장 빠른 주문 시간을 얻는 함수
            getFadingMenuItemStatus={getFadingMenuItemStatus}
          />
        </>
      )}
    </S.LiveOrderPageWrapper>
  );
};

export default LiveOrderPage;
