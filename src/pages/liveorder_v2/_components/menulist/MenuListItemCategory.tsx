import styled from "styled-components";

const MenuListItemCategory = () => {
  const categories = [
    { label: "주문시각", flex: 1 },
    { label: "테이블", flex: 1 },
    { label: "메뉴", flex: 2 },
    { label: "수량", flex: 1 },
    { label: "상태", flex: 1 },
  ];
  return (
    <Wrapper>
      {categories.map((category, index) => (
        <MenuListItemCategoryText key={index} style={{ flex: category.flex }}>
          {category.label}
        </MenuListItemCategoryText>
      ))}
    </Wrapper>
  );
};

export default MenuListItemCategory;

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  height: 58px;
  padding-left: 70px;
  box-sizing: border-box;

  border-bottom: 1px solid rgba(192, 192, 192, 0.5);
`;

const MenuListItemCategoryText = styled.div`
  display: flex;

  justify-content: center;
  color: ${({ theme }) => theme.colors.Black01};
  ${({ theme }) => theme.fonts.Bold14}
`;
