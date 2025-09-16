import * as S from "./MenuList.styled";
import MenuListHeader from "./MenuListHeader";
import DropDown from "./DropDown";
import MenuListItemCategory from "./MenuListItemCategory";
import MenuListItem from "./MenuListItem";
import { useState, useMemo } from "react";
import { useLiveOrderStore } from "@pages/liveorder_v2/LiveOrderStore";
import { useCurrentTime } from "../../hooks/useCurrentTime";
import { useMenuData } from "../../hooks/useMemoData"; // 새로 만든 훅 임포트
import { ORDER_DELETE_TIME } from "@constants/timeConstant";

const MenuList = () => {
  const { orders, updateOrderStatusWithAnimation } = useLiveOrderStore();
  const [selectedMenu, setSelectedMenu] = useState<string>("메뉴");
  const currentTime = useCurrentTime(10000);

  // 새로 생성한 훅을 호출하여 메뉴 데이터를 불러옵니다.
  useMenuData();

  const processedOrders = useMemo(() => {
    const timeFiltered = orders.filter((order) => {
      if (order.status !== "served") return true;
      if (order.servedAt && currentTime - order.servedAt < ORDER_DELETE_TIME) {
        return true;
      }
      return false;
    });
    // const timeFiltered = orders;

    const menuFiltered =
      selectedMenu === "메뉴" || selectedMenu === "전체"
        ? timeFiltered
        : timeFiltered.filter((order) => order.menu_name === selectedMenu);

    return [...menuFiltered].sort((a, b) => {
      const aIsServed = a.status === "served";
      const bIsServed = b.status === "served";
      if (aIsServed && !bIsServed) return 1;
      if (!aIsServed && bIsServed) return -1;
      return (
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    });
  }, [orders, selectedMenu, currentTime]);

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
