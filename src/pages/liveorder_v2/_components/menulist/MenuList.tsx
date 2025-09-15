import * as S from "./MenuList.styled";
import MenuListHeader from "./MenuListHeader";
import DropDown from "./DropDown";
import MenuListItemCategory from "./MenuListItemCategory";
import MenuListItem from "./MenuListItem";
import { useState, useMemo } from "react";
import { useLiveOrderStore } from "@pages/liveorder_v2/LiveOrderStore";
import { useCurrentTime } from "../../hooks/useCurrentTime";
import { useMenuData } from "../../hooks/useMemoData"; // 새로 만든 훅 임포트

const ORDER_DELETE_TIME = 1 * 10 * 1000;

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

// import * as S from "./MenuList.styled";

// import MenuListHeader from "./MenuListHeader";
// import DropDown from "./DropDown";
// import MenuListItemCategory from "./MenuListItemCategory";
// import MenuListItem from "./MenuListItem";

// import { useEffect, useState, useMemo } from "react";
// import { useLiveOrderStore } from "@pages/liveorder_v2/LiveOrderStore";
// import { useCurrentTime } from "../../hooks/useCurrentTime";
// // 3분을 밀리초 단위로 변환한 상수
// const ORDER_DELETE_TIME = 1 * 10 * 1000;

// const MenuList = () => {
//   const { orders, fetchOrders, updateOrderStatusWithAnimation } =
//     useLiveOrderStore();
//   const [selectedMenu, setSelectedMenu] = useState<string>("메뉴");

//   // 1. 커스텀 훅을 호출하여 1분마다 업데이트되는 시간을 가져옴
//   const currentTime = useCurrentTime(10000);

//   // 2. 컴포넌트가 처음 렌더링될 때 '주문' 데이터를 불러옵니다. (수정됨)
//   useEffect(() => {
//     fetchOrders();
//   }, [fetchOrders]);

//   const processedOrders = useMemo(() => {
//     const timeFiltered = orders.filter((order) => {
//       if (order.status !== "SERVED") return true;
//       if (order.servedAt && currentTime - order.servedAt < ORDER_DELETE_TIME) {
//         return true;
//       }
//       return false;
//     });

//     const menuFiltered =
//       selectedMenu === "메뉴" || selectedMenu === "전체"
//         ? timeFiltered
//         : timeFiltered.filter((order) => order.menu_name === selectedMenu);

//     return [...menuFiltered].sort((a, b) => {
//       const aIsServed = a.status === "SERVED";
//       const bIsServed = b.status === "SERVED";
//       if (aIsServed && !bIsServed) return 1;
//       if (!aIsServed && bIsServed) return -1;
//       return (
//         new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
//       );
//     });
//   }, [orders, selectedMenu, currentTime]);
//   return (
//     <S.MenuListWrapper>
//       <MenuListHeader />
//       <S.DropDownWrapper>
//         <DropDown
//           selectedOption={selectedMenu}
//           onOptionSelect={setSelectedMenu}
//         />
//       </S.DropDownWrapper>

//       <S.MenuListItemWrapper>
//         <MenuListItemCategory />
//         <S.MenuListItemContainer>
//           {processedOrders.map((order) => (
//             <MenuListItem
//               key={order.id}
//               order={order}
//               // 3. 스토어의 새 액션을 호출하도록 변경
//               onStatusChange={updateOrderStatusWithAnimation}
//             />
//           ))}
//         </S.MenuListItemContainer>
//       </S.MenuListItemWrapper>
//     </S.MenuListWrapper>
//   );
// };

// export default MenuList;
