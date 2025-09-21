import styled from "styled-components";

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

  transition: transform 0.15s ease-in-out;

  &:active {
    transform: scale(0.95);
  }
`;
