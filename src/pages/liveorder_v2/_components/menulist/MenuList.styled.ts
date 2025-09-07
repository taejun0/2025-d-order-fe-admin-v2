import styled from "styled-components";

//메뉴별 주문 리스트 wrapper
export const MenuListWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 65%;
  height: calc(var(--vh, 1vh) * 90);
  border-radius: 10px;
  background-color: ${({ theme }) => theme.colors.Gray01};

  padding: 25px 28px;
  box-sizing: border-box;

  gap: 8px;
`;

export const DropDownWrapper = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
`;

// 주문리스트 카테고리랑 아이템 묶는용도 디브
export const MenuListItemWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 0;
`;
// 주문이 많을때 컴포넌트 안에서 스크롤가능하게 하는 디브
export const MenuListItemContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  flex: 1;
  overflow-y: auto;
  max-height: 100%; /* 헤더와 카테고리 높이를 고려하여 조정 */
  min-height: 0;
  &::-webkit-scrollbar {
    width: 2px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.2);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-track {
    background-color: transparent;
  }
`;
