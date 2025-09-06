import * as S from "./MenuList.styled";

import MenuListHeader from "./MenuListHeader";
import DropDown from "./DropDown";
import MenuListItemCategory from "./MenuListItemCategory";
import MenuListItem from "./MenuListItem";

import { useEffect, useState } from "react";
import { useLiveOrderStore } from "@pages/liveorder_v2/LiveOrderStore";

const MenuList = () => {
  const { orders, fetchOrders, changeOrderStatus } = useLiveOrderStore();
  const [selectedMenu, setSelectedMenu] = useState<string>("메뉴");
  // 2. 컴포넌트가 처음 렌더링될 때 '주문' 데이터를 불러옵니다. (수정됨)
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  //드롭다운 필터링
  const filteredOrders =
    selectedMenu === "메뉴" || selectedMenu === "전체"
      ? orders
      : orders.filter((order) => order.menu_name === selectedMenu);

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
          {filteredOrders.map((order) => (
            <MenuListItem
              key={order.id}
              order={order}
              onStatusChange={changeOrderStatus}
            />
          ))}
        </S.MenuListItemContainer>
      </S.MenuListItemWrapper>
    </S.MenuListWrapper>
  );
};

export default MenuList;
