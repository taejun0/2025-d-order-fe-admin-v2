import styled from "styled-components";

export const ItemWrapper = styled.div`
  display: grid;
  grid-template-columns: 3fr 1fr 1.5fr;
  align-items: center;
  padding: 8px 0;
  font-size: 15px;
`;

export const MenuName = styled.span`
  text-align: center;
`;

export const Quantity = styled.span`
  text-align: center;
`;

// 수정 이유: Status 컴포넌트 내부에서 버튼이 중앙 정렬되도록 display: flex를 추가합니다.
export const Status = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;
