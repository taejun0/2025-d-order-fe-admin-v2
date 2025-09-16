import styled, { keyframes } from "styled-components";
//실시간주문 메뉴 리스트 컴포넌트쪽 스타일링
export const LiveOrderMenuList = styled.div`
  display: flex;
  flex-direction: column;
  width: 65%;
  height: calc(var(--vh, 1vh) * 90);
  border-radius: 10px;
  background-color: ${({ theme }) => theme.colors.Gray01};

  padding: 25px 28px;
  box-sizing: border-box;
`;

export const LiveOrderMenuListHeader = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  justify-content: space-between;
`;

export const HeaderBtnWrapper = styled.div`
  display: flex;
  gap: 2px;
  color: ${({ theme }) => theme.colors.Black01};
  ${({ theme }) => theme.fonts.Bold20}
`;

interface OrderModeBtnProps {
  $isActive: boolean;
}

export const OrderModeBtn = styled.div<OrderModeBtnProps>`
  color: ${({ theme, $isActive }) =>
    $isActive ? theme.colors.Black01 : theme.colors.Black02};
  ${({ theme }) => theme.fonts.ExtraBold20}
  cursor: pointer;
  transition: color 0.2s ease;
`;

export const LastUpdateTime = styled.button`
  margin-top: 5px;
  color: ${({ theme }) => theme.colors.Focused};
  ${({ theme }) => theme.fonts.SemiBold12}
`;
export const NonOrderText = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  justify-content: center;
  align-items: center;
  color: ${({ theme }) => theme.colors.Black02};
  ${({ theme }) => theme.fonts.ExtraBold20}
`;
// 버튼 클릭 애니메이션 정의
const scaleAnimation = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
`;

export const HeaderReloadButton = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 108px;
  height: 30px;

  padding: 7px 9px;
  box-sizing: border-box;

  gap: 5px;

  border-radius: 20px;

  background-color: ${({ theme }) => theme.colors.Black02};
  color: ${({ theme }) => theme.colors.Bg};
  ${({ theme }) => theme.fonts.Bold12};
  white-space: nowrap;
  &:active {
    animation: ${scaleAnimation} 0.3s ease;
  }
`;

export const MenuListCategory = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  height: 58px;
  margin-top: 5px;
  padding-left: 70px;
  box-sizing: border-box;

  border-bottom: 1px solid rgba(192, 192, 192, 0.5);
`;
export const MenuListCategoryText = styled.div`
  display: flex;

  justify-content: center;
  color: ${({ theme }) => theme.colors.Black01};
  ${({ theme }) => theme.fonts.Bold14}
`;

// 스크롤 가능한 메뉴 컨테이너
export const ScrollableMenuContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  flex: 1;
  overflow-y: auto;
  max-height: 100%; /* 헤더와 카테고리 높이를 고려하여 조정 */

  /* 얇은 스크롤바 스타일링 */
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

  /* Firefox용 얇은 스크롤바 */
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
`;
