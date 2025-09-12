import styled from "styled-components";

export const LiveOrderMenuList = styled.div`
  display: flex;
  flex-direction: column;
  width: 50%;
  height: 100%;
  background-color: ${({ theme }) => theme.colors.White};
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 20px;
  box-sizing: border-box;
`;

export const LiveOrderMenuListHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

export const HeaderTitle = styled.h2`
  font-size: 20px;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.Black};
  margin: 0;
`;

export const LastUpdateTime = styled.p`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.Gray01};
  margin-top: 5px;
`;

export const HeaderReloadButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: ${({ theme }) => theme.colors.Black02};
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;

  img {
    width: 16px;
    height: 16px;
  }
`;

export const MenuListCategory = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 10px;
  background-color: ${({ theme }) => theme.colors.Gray01};
  border-radius: 5px;
`;

export const MenuListCategoryText = styled.div`
  font-size: 14px;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.Black01};
  text-align: center;
`;

export const ScrollableMenuContainer = styled.div`
  flex-grow: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 10px;

  /* 스크롤바 스타일 */
  &::-webkit-scrollbar {
    width: 8px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: ${({ theme }) => theme.colors.Gray01};
    border-radius: 4px;
  }
  &::-webkit-scrollbar-track {
    background-color: ${({ theme }) => theme.colors.Gray01};
  }
`;

export const NonOrderText = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: ${({ theme }) => theme.colors.Black02};
  font-size: 16px;
`;