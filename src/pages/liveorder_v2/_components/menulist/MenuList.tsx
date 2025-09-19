import * as S from "./MenuList.styled";
import MenuListHeader from "./MenuListHeader";
import DropDown from "./DropDown";
import MenuListItemCategory from "./MenuListItemCategory";
import MenuListItem from "./MenuListItem";
import { useState, useMemo } from "react";
import { useLiveOrderStore } from "@pages/liveorder_v2/LiveOrderStore";

import { useMenuData } from "../../hooks/useMenuData"; // 새로 만든 훅 임포트

const MenuList = () => {
  const { orders, updateOrderStatusWithAnimation } = useLiveOrderStore();
  const [selectedMenu, setSelectedMenu] = useState<string>("메뉴");

  // 새로 생성한 훅을 호출하여 메뉴 데이터를 불러옵니다.
  useMenuData();

  const processedOrders = useMemo(() => {
    if (!orders || orders.length === 0) return [];

    // 1. order_id 기준으로 그룹핑
    const groupedOrders = orders.reduce((acc, order) => {
      const groupKey = order.order_id.toString();
      if (!acc[groupKey]) acc[groupKey] = [];
      acc[groupKey].push(order);
      return acc;
    }, {} as Record<string, typeof orders>);

    // 2. 모든 주문이 served인 그룹은 목록에서 제외
    const filteredOrders = Object.values(groupedOrders)
      .filter((group) => !group.every((order) => order.status === "served"))
      .flat();

    // 3. 메뉴 필터 적용
    const menuFiltered =
      selectedMenu === "메뉴" || selectedMenu === "전체"
        ? filteredOrders
        : filteredOrders.filter((order) => order.menu_name === selectedMenu);

    // 4. 서빙완료 주문은 맨 아래로, 나머지는 시간순 정렬
    return [...menuFiltered].sort((a, b) => {
      const aServed = a.status === "served";
      const bServed = b.status === "served";
      if (aServed && !bServed) return 1;
      if (!aServed && bServed) return -1;
      return (
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    });
  }, [orders, selectedMenu]);
  return (
    <S.MenuListWrapper>
      <MenuListHeader />
      <S.DropDownWrapper>
        <DropDown
          selectedOption={selectedMenu}
          onOptionSelect={setSelectedMenu}
        />
      </S.DropDownWrapper>

      <S.MenuListItemWrapper>
        <MenuListItemCategory />
        <S.MenuListItemContainer>
          {processedOrders.map((order) => (
            <MenuListItem
              key={order.id}
              order={order}
              onStatusChange={updateOrderStatusWithAnimation}
            />
          ))}
        </S.MenuListItemContainer>
      </S.MenuListItemWrapper>
    </S.MenuListWrapper>
  );
};

export default MenuList;
