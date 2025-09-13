import styled, { css } from "styled-components";

export const CardWrapper = styled.div<{ $isOverdue: boolean }>`
  background-color: ${({ theme, $isOverdue }) =>
    $isOverdue ? theme.colors.Point : theme.colors.Gray01};  
  color: ${({ theme }) => theme.colors.Black01};
  width: 8.5rem;
  height: 11.5rem;
  
  @media (min-width: 1180px) {
    width: 10rem;
    height: 12.2rem;
  }

  @media (min-width: 1366px) {
    width: 12.4rem;
    height: 16.2rem;
  }

  border-radius: 0.8rem;
  border: 1px solid ${({ theme }) => theme.colors.Gray01};
  padding: 0.8rem 0.7rem;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  position: relative;

  img {
    width: 100%;
  }
`;


export const TableInfo = styled.div<{ $isOverdue: boolean }>`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.65rem;
  .tableNumber {
    font-size: 0.8rem;
    font-weight: 700;
    ${({ theme }) => css(theme.fonts.Bold14)};
    @media (min-width: 1180px) {
      font-size: 1rem;
    }
    @media (min-width: 1366px) {
      font-size: 1.2rem;
    }
    
  }
  .orderTime {
    font-size: 0.6rem;
    font-weight: 600;
    color: ${({ theme, $isOverdue }) =>
    $isOverdue ? theme.colors.Orange01 : theme.colors.Black01};  ;
    ${({ theme }) => css(theme.fonts.SemiBold12)};
    @media (min-width: 1180px) {
      font-size: 0.8rem;
    }
    @media (min-width: 1366px) {
      font-size: 0.9rem;
    }
    
  }
`;

export const DivideLine = styled.div`
  width: 100%;
  height: 0.5px;
  background-color: rgba(192, 192, 192, 0.50);
  border-bottom: 1px solid #c0c0c0;
`;

export const MenuList = styled.div`
  width: 100%;
  min-height: 7.9rem;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  
  img {
    width: 100%;
  }
  
`;

export const MenuItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-top: 0.8rem;
  margin-bottom: 0.5rem;
  .menuName {
    font-size: 0.75rem;
    ${({ theme }) => css(theme.fonts.Bold12)};
    @media (min-width: 1180px) {
      font-size: 0.8rem;
    }
    @media (min-width: 1366px) {
      font-size: 0.9rem;
    }
  }
  .menuAmount {
    font-size: 0.75rem;
    ${({ theme }) => css(theme.fonts.Medium12)};
    font-weight: 500;
    @media (min-width: 1180px) {
      font-size: 0.8rem;
    }
    @media (min-width: 1366px) {
      font-size: 0.9rem;
    }
  }
`;

export const ToDetail = styled.div`
  width: 100%;
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;
  color: ${({ theme }) => theme.colors.Orange01};
  font-size: 0.6rem;
  font-weight: 600;
  padding: 0.4rem 0 0 0;
  ${({ theme }) => css(theme.fonts.SemiBold10)};
  @media (min-width: 1180px) {
      font-size: 0.7rem;
    }
    @media (min-width: 1366px) {
      font-size: 0.8rem;
    }
`;

export const TotalPrice = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  position: absolute;
  bottom: 0.8rem;
  .totalPrice {
    margin-left: 0.7rem;
    font-size: 0.75rem;
    font-weight: 700;
    ${({ theme }) => css(theme.fonts.Bold12)};
    @media (min-width: 1180px) {
      font-size: 0.8rem;
    }
    @media (min-width: 1366px) {
      font-size: 0.9rem;
    }
  }
`;

// grid style
export const GridWrapper = styled.div`
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 10px 20px;
  gap: 0.55rem;
  box-sizing: border-box;
  user-select: none;
`;

/* 좌우 네비 */
const navBase = css`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 3;
  width: 36px;
  height: 36px;
  border-radius: 999px;
  border: none;
  background: rgba(0,0,0,0.55);
  color: #fff;
  font-size: 22px;
  line-height: 36px;
  text-align: center;
  cursor: pointer;
  transition: opacity 0.2s ease;
  &:hover { opacity: 0.9; }
`;
export const NavButtonLeft = styled.button`${navBase}; left: 8px;`;
export const NavButtonRight = styled.button`${navBase}; right: 8px;`;

/* 뷰포트 */
export const GridViewport = styled.div`
  position: relative;
  width: 100%;
  overflow: hidden;
`;

/* ✅ 트랙: 전체 폭 = pageCount * 100% (부모 기준)
   ✅ 이동: 한 페이지당 (100 / pageCount)% 만큼 이동 */
export const PagesTrack = styled.div<{
  $pageCount: number;
  $currentPage: number;
}>`
  display: flex;
  width: ${({ $pageCount }) => $pageCount * 100}%;
  transform: ${({ $currentPage, $pageCount }) =>
    `translateX(-${$pageCount ? ($currentPage * 100) / $pageCount : 0}%)`};
  transition: transform 320ms ease-in-out;
`;

/* ✅ 각 페이지: 트랙 대비 (100 / pageCount)% */
export const PageGrid = styled.div<{ $pageCount: number }>`
  width: ${({ $pageCount }) => (100 / $pageCount)}%;
  padding: 8px;
  box-sizing: border-box;

  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr)); /* 가로 5 */
  grid-auto-rows: 1fr;                               /* 세로 동일 비율 */
  row-gap: 12px;
  column-gap: 12px;
`;

/* 인디케이터 (중복 정의 없게 유지) */
export const PageIndicatorWrapper = styled.div`
  display: flex;
  gap: 8px;
  justify-content: center;
  align-items: center;
  height: 28px;
  margin-top: 8px;
`;

export const Dot = styled.div<{ $active: boolean }>`
  width: ${({ $active }) => ($active ? "1.6rem" : "0.6rem")};
  height: 0.6rem;
  border-radius: 0.3rem;
  background-color: ${({ theme, $active }) =>
    $active ? theme.colors.Orange01 : theme.colors.Gray01};
  transition: all 0.3s ease;
  cursor: pointer;
`;
