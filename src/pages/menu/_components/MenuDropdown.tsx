import { useState } from "react";
import * as S from "./MenuDropdown.styled";
import { IMAGE_CONSTANTS } from "@constants/imageConstants";
import { boothDataDummy } from "../dummy/dummydata";

interface MenuDropDownProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const MenuDropdown = ({ isOpen, setIsOpen }: MenuDropDownProps) => {
  const [mainMenus, SetMainMenus] = useState<string[]>(
    boothDataDummy.menus
      .filter((menu) => menu.menu_category === "메인")
      .map((menu) => menu.menu_name)
  );
  const [drinkMenus, SetDrinkMainMenus] = useState<string[]>(
    boothDataDummy.menus
      .filter((menu) => menu.menu_category === "음료")
      .map((menu) => menu.menu_name)
  );
  const [selectedMenu, setSelectedMenu] = useState<string>("메뉴 선택");

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <S.Wrapper>
      <S.SelectBox onClick={handleToggle} $isOpen={isOpen}>
        <span>{selectedMenu}</span>
        <S.ArrowIcon src={IMAGE_CONSTANTS.UP} $isOpen={isOpen} alt="arrow" />
      </S.SelectBox>
      {isOpen && (
        <S.OptionBox>
          <S.Option className="disabled">메뉴</S.Option>
          {mainMenus.map((menu, idx) => (
            <S.Option
              key={idx}
              onClick={() => {
                setSelectedMenu(menu);
                setIsOpen(false);
              }}
            >
              {menu}
            </S.Option>
          ))}
          <S.Option className="disabled">음료</S.Option>
          {drinkMenus.map((menu, idx) => (
            <S.Option
              key={idx}
              onClick={() => {
                setSelectedMenu(menu);
                setIsOpen(false);
              }}
            >
              {menu}
            </S.Option>
          ))}
        </S.OptionBox>
      )}
    </S.Wrapper>
  );
};

export default MenuDropdown;
