import styled from 'styled-components';

export const OrderPageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: calc(100vh - 80px); /* 헤더 높이 제외 */
  padding: 20px;
  box-sizing: border-box;
  background-color: ${({ theme }) => theme.colors.Gray01};
`;

export const ViewModeSelector = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
`;

export const ViewModeButton = styled.button<{ $active: boolean }>`
  padding: 10px 20px;
  font-size: 16px;
  font-weight: bold;
  border: 1px solid ${({ $active, theme }) => $active ? theme.colors.Black01 : theme.colors.Gray01};
  border-radius: 8px;
  cursor: pointer;
  background-color: ${({ $active, theme }) => $active ? theme.colors.Black01 : '#FFFFFF'};
  color: ${({ $active, theme }) => $active ? '#FFFFFF' : theme.colors.Black01};
  transition: all 0.2s ease-in-out;

  &:hover {
    opacity: 0.8;
  }
`;

export const ContentWrapper = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;
  gap: 20px;
  flex-grow: 1;
  overflow: hidden;
`;

export const LoadingContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    font-size: 24px;
`;