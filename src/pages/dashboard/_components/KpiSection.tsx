// KpiSection.tsx
import * as S from '../DashboardPage.styled';
import { KPI } from '../_services/dashboard.types';

type Props = { kpi?: KPI };

const EMPTY_KPI: KPI = {
  totalOrders: 0,
  recentOrders: 0,
  visitors: 0,
  recentVisitors: 0,
  avgTableUsageMin: 0,
  turnoverRate: 0,
  servedCount: 0,
  waitingCount: 0,
};

export default function KpiSection({ kpi }: Props) {
  const v = kpi ?? EMPTY_KPI;

  return (
    <>
      <S.KpiLeft>
        <S.KpiCard>
          <S.KpiLabel>총 주문 건수</S.KpiLabel>
          <S.KpiContent>
            <S.KpiValue>{v.totalOrders}건</S.KpiValue>
            <S.KpiNotePositive>
              한 시간 전 대비 {v.recentOrders ?? 0}건 증가
            </S.KpiNotePositive>
          </S.KpiContent>
        </S.KpiCard>
        <S.KpiCard>
          <S.KpiLabel>방문자 수</S.KpiLabel>
          <S.KpiContent>
            <S.KpiValue>{v.visitors}명</S.KpiValue>
            <S.KpiNotePositive>
              한 시간 전 대비 {v.recentVisitors ?? 0}명 증가
            </S.KpiNotePositive>
          </S.KpiContent>
        </S.KpiCard>
        <S.KpiCard>
          <S.KpiLabel>테이블 평균 이용 시간</S.KpiLabel>
          <S.KpiContent>
            <S.KpiValue>{v.avgTableUsageMin}분</S.KpiValue>
            <S.KpiNotePositive>
              회전율 {Number(v.turnoverRate ?? 0).toFixed(0)}% 효율
            </S.KpiNotePositive>
          </S.KpiContent>
        </S.KpiCard>
      </S.KpiLeft>

      <S.KpiRight>
        <S.KpiRightItem>
          <S.KpiLabel>서빙 완료</S.KpiLabel>
          <S.KpiValue>{v.servedCount}개</S.KpiValue>
        </S.KpiRightItem>
        <S.RowLine />
        <S.KpiRightItem>
          <S.KpiLabel>서빙 대기</S.KpiLabel>
          <S.KpiValue $orange>{v.waitingCount}개</S.KpiValue>
        </S.KpiRightItem>
      </S.KpiRight>
    </>
  );
}
