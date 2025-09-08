import styled from 'styled-components';

export const Page = styled.main`
  display: grid;
  grid-template-columns: repeat(15, 1fr);
  grid-template-rows: auto 1fr; /* 1행: KPI, 2행: 본문(좌/우) */
  grid-template-areas:
    'kpiL kpiL kpiL kpiL kpiL kpiL kpiL kpiL kpiL kpiR kpiR kpiR kpiR kpiR kpiR'
    'left left left left left left left left left wait wait wait wait wait wait'
    'left left left left left left left left left none none none none none none';
  gap: 20px;
  padding: 20px;
`;

/* 1행 좌 - 2를 3등분(= 1fr 1fr 1fr) */
export const KpiLeft = styled.section`
  grid-area: kpiL;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
`;

export const KpiCard = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.Orange01};
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  border-radius: 1rem;
  padding: 1rem;
  box-sizing: border-box;
`;

export const KpiContent = styled.div`
  display: flex;
  flex-direction: column;
`;

export const KpiLabel = styled.div`
  ${({ theme }) => theme.fonts.Medium14};
  color: ${({ theme }) => theme.colors.Black};
`;

export const KpiValue = styled.div<{ orange?: boolean }>`
  ${({ theme }) => theme.fonts.Bold24};
  color: ${({ theme, orange }) =>
    orange ? theme.colors.Orange01 : theme.colors.Black};
`;
export const KpiNote = styled.div`
  ${({ theme }) => theme.fonts.SemiBold10};
`;

export const KpiNotePositive = styled(KpiNote)`
  color: ${({ theme }) => theme.colors.Success};
`;

/* 1행 우 - 하나의 카드 안을 1:1 */
export const KpiRight = styled.section`
  position: relative;
  grid-area: kpiR;
  border: 1px solid ${({ theme }) => theme.colors.Orange01};
  border-radius: 16px;
  padding: 1rem;
  box-sizing: border-box;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  align-items: center;
`;

export const KpiRightItem = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
`;

export const LeftCol = styled.section`
  grid-area: left;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

/* 3행 좌 - 품절 임박 */
export const LowStock = styled.section`
  border: 1px solid ${({ theme }) => theme.colors.Orange01};

  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  border-radius: 1rem;
  padding: 1rem;
  align-self: start;
`;

/* 2행 좌 - TOP3 */
export const Top3 = styled.section`
  border: 1px solid ${({ theme }) => theme.colors.Orange01};

  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  border-radius: 1rem;
  padding: 1rem;
  align-self: start;
`;

export const SectionTitle = styled.h2`
  ${({ theme }) => theme.fonts.Medium14};
  color: ${({ theme }) => theme.colors.Black};
`;

export const CardGrid = styled.div<{ columns: number }>`
  display: grid;
  grid-template-columns: repeat(${({ columns }) => columns}, minmax(0, 1fr));
  gap: 16px;

  @media (max-width: 800px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  @media (max-width: 500px) {
    grid-template-columns: 1fr;
  }
`;

export const MenuCard = styled.div`
  position: relative;
  background-color: ${({ theme }) => theme.colors.Gray01};
  border-radius: 0.5rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 1rem;
  gap: 0.5rem;
`;

export const Line = styled.div`
  display: flex;
  flex-direction: row;

  justify-content: space-between;
`;

export const RankingImage = styled.img`
  position: absolute;
  left: 1rem;
  top: 1rem;
`;

export const Image = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

export const ItemName = styled.div`
  ${({ theme }) => theme.fonts.Bold14};
  color: ${({ theme }) => theme.colors.Black01};
`;

export const ItemCost = styled.div<{ Focused?: boolean }>`
  ${({ theme }) => theme.fonts.SemiBold12};
  color: ${({ theme, Focused }) =>
    Focused ? theme.colors.Focused : theme.colors.Error};
`;

export const ItemAmount = styled.div<{ Focused?: boolean }>`
  ${({ theme }) => theme.fonts.SemiBold10};
  color: ${({ theme, Focused }) =>
    Focused ? theme.colors.Focused : theme.colors.Error};
`;

/* 2~3행 우 - 대기시간 패널 */
export const WaitPanel = styled.aside`
  border: 1px solid ${({ theme }) => theme.colors.Orange01};
  grid-area: wait;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 1rem;
  padding: 1rem;
  gap: 0.75rem;

  box-sizing: border-box;
  align-self: start;
`;

export const Donut = styled.div`
  ${({ theme }) => theme.fonts.ExtraBold26};
  width: 70%;

  font-size: 2.5rem;
  aspect-ratio: 1 / 1;
  border-radius: 50%;
  background: radial-gradient(circle, #fff 55%, transparent 50%) /* 속을 비움 */,
    ${({ theme }) => theme.colors.Orange01};
  box-shadow: inset 0 0 0 0 ${({ theme }) => theme.colors.Orange01};
  display: grid;
  place-items: center;
`;

export const PanelDivider = styled.div`
  height: 1px;
`;

export const PanelRow = styled.div`
  position: relative;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
`;

export const PenelHeight = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100px;
  align-items: center;
  justify-content: space-around;
`;

export const PanelSmall = styled.div`
  ${({ theme }) => theme.fonts.Medium14};
`;

export const PanelStrong = styled.div<{ orange?: boolean }>`
  ${({ theme }) => theme.fonts.Bold24};
  color: ${({ theme, orange }) =>
    orange ? theme.colors.Orange01 : theme.colors.Black};
`;

export const RowLine = styled.div<{ check?: boolean }>`
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  background-color: ${({ theme }) => theme.colors.Orange01};
  height: ${({ check }) => (check ? 'calc(100% - 16px)' : 'calc(100% - 48px)')};
  top: ${({ check }) => (check ? '18px' : '24px')};
  width: 1px;
`;
