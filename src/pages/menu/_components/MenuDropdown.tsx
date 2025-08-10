import * as S from "./MenuDropdown.styled";
import { IMAGE_CONSTANTS } from "@constants/imageConstants";

interface MenuDropDownProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const MenuDropdown = ({ isOpen, setIsOpen }: MenuDropDownProps) => {
  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <S.Wrapper className="ddd">
      <S.SelectBox onClick={handleToggle} $isOpen={isOpen}>
        <span>메뉴 선택</span>
        <S.ArrowIcon src={IMAGE_CONSTANTS.UP} $isOpen={isOpen} alt="arrow" />
      </S.SelectBox>
      {isOpen && (
        <S.OptionBox>
          <S.Option>ds</S.Option>
        </S.OptionBox>
      )}
    </S.Wrapper>
  );
};

export default MenuDropdown;
