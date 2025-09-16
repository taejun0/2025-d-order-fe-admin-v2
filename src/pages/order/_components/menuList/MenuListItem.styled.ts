import styled from "styled-components";

export const MenuListItemWrapper = styled.div<{ $isServed: boolean }>`
  display: flex;
  align-items: center;
  padding: 15px 10px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.Gray01};
  background-color: ${({ theme, $isServed }) => $isServed ? theme.colors.Gray01 : theme.colors.White};
`;

export const MenuItemText = styled.div<{ flex: number }>`
  flex: ${({ flex }) => flex};
  text-align: center;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.Black};
`;

export const MenuInfo = styled.div<{ flex: number }>`
  flex: ${({ flex }) => flex};
  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: center;
`;

export const MenuImage = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 5px;
  object-fit: cover;
`;

export const MenuStatus = styled.div<{ flex: number }>`
  flex: ${({ flex }) => flex};
  display: flex;
  justify-content: center;
  align-items: center;
`;