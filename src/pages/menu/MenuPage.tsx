import * as S from "./MenuPage.styled";
import MenuCreateCard from "./_components/MenuCreateCard";
import TableFeeCard from "./_components/TableFeeCard";
import MenuCard from "./_components/MenuCard";
import { useEffect, useState } from "react";
import MenuService from "./api/MenuService";
import { LoadingSpinner } from "./api/LoadingSpinner";
import { BoothMenuData, Menu, TableInfo } from "./Type/Menu_type";
import { boothDataDummy } from "./dummy/dummydata";
import SetMenuCard from "./_components/SetMenuCard";

const MenuPage = () => {
  const [boothMenuData, setBoothMenuData] = useState<BoothMenuData>();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMenus = async () => {
    try {
      setLoading(true);
      setError(null);
      // const data = await MenuService.getMenuList();
      // setMenus(data);
      setBoothMenuData(boothDataDummy); // 더미 데이터 사용
    } catch (error) {
      setError("메뉴 목록을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenus();
  }, []);

  // 테이블 이용료 분류 (menu_category가 "테이블 이용료"인 메뉴)
  // const tableFeeMenu = menus.find(
  //   (menu) => menu.menu_category === "테이블 이용료"
  // );

  // // 테이블 이용료가 없을 때 사용할 기본 메뉴 객체
  // const defaultTableFeeMenu: Menu = {
  //   menu_id: -1,
  //   menu_name: "테이블 이용료",
  //   menu_price: 0,
  //   menu_description: "테이블 이용료 없음",
  //   menu_category: "테이블 이용료",
  //   is_selling: true,
  //   menu_image: "",
  // };

  // 테이블 이용료 분류
  const tableFeeMenu = boothMenuData?.table;

  const defaultTableFeeMenu: TableInfo = {
    seat_type: "테이블 이용료 없음",
    seat_tax_person: "",
  };

  // 일반 메뉴 분류 (menu_category가 "테이블 이용료"가 아닌 메뉴)
  const regularMenus = boothMenuData?.menus
    // 카테고리 우선순위: 차지 -> 메뉴 -> 음료
    .sort((a, b) => {
      const categoryOrder = {
        차지: 0,
        메인: 1,
        음료: 2,
      };

      // 카테고리가 다르면 카테고리 순서로 정렬
      if (a.menu_category !== b.menu_category) {
        return (
          (categoryOrder[a.menu_category as keyof typeof categoryOrder] ||
            999) -
          (categoryOrder[b.menu_category as keyof typeof categoryOrder] || 999)
        );
      }

      // 같은 카테고리면 비싼 순서로 정렬
      return b.menu_price - a.menu_price;
    });
  const setMenus = boothMenuData?.setmenus;
  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <S.MenuPageWrapper>
      <S.MenuGrid>
        <MenuCreateCard onMenuChange={fetchMenus} />
        <TableFeeCard table={tableFeeMenu || defaultTableFeeMenu} />
        {regularMenus?.map((menu) => (
          <MenuCard key={menu.menu_id} menu={menu} onMenuChange={fetchMenus} />
        ))}
        {setMenus?.map((setMenu) => (
          <SetMenuCard
            key={setMenu.set_menu_id}
            menu={setMenu}
            onMenuChange={fetchMenus}
          />
        ))}
      </S.MenuGrid>
    </S.MenuPageWrapper>
  );
};

export default MenuPage;
