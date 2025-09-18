import styled from "styled-components";

//테이블별 주문 리스트 wrapper
export const TableListWrapper = styled.div`
  display: flex;
  justify-content: center;
  width: 31%;
  height: calc(var(--vh, 1vh) * 90);
  border-radius: 10px 0 0 10px;
  background-color: ${({ theme }) => theme.colors.Gray01};

  padding-top: 25px;
  padding-bottom: 10px;
  box-sizing: border-box;
`;

export const TableListContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 78%;
  gap: 27px;
  //내부 스크롤가능하게 허용
  overflow-y: auto;
  max-height: 100%;

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
