import * as S from '../DashboardPage.styled';
import { KPI } from '../_services/dashboard.types';

type Props = { kpi: KPI };

export default function KpiSection({ kpi }: Props) {
  return (
    <>
      <S.KpiLeft>
        <S.KpiCard>
          <S.KpiLabel>총 주문 건수</S.KpiLabel>
          <S.KpiContent>
            <S.KpiValue>{kpi.totalOrders}건</S.KpiValue>
            <S.KpiNotePositive>한 시간 전 대비 0건 증가</S.KpiNotePositive>
          </S.KpiContent>
        </S.KpiCard>
        <S.KpiCard>
          <S.KpiLabel>방문자 수</S.KpiLabel>
          <S.KpiContent>
            <S.KpiValue>{kpi.visitorsPerTable}명/테이블</S.KpiValue>
            <S.KpiNotePositive>한 시간 전 대비 0명 증가</S.KpiNotePositive>
          </S.KpiContent>
        </S.KpiCard>
        <S.KpiCard>
          <S.KpiLabel>테이블 평균 이용 시간</S.KpiLabel>
          <S.KpiContent>
            <S.KpiValue>{kpi.avgTableMinutes}분</S.KpiValue>
            <S.KpiNotePositive>회전율 0.0% 향상</S.KpiNotePositive>
          </S.KpiContent>
        </S.KpiCard>
      </S.KpiLeft>

      <S.KpiRight>
        <S.KpiRightItem>
          <S.KpiLabel>서빙 완료 메뉴</S.KpiLabel>
          <S.KpiValue>{kpi.servedCount}개</S.KpiValue>
        </S.KpiRightItem>
        <S.RowLine />
        <S.KpiRightItem>
          <S.KpiLabel>서빙 대기 메뉴</S.KpiLabel>
          <S.KpiValue orange>{kpi.waitingCount}개</S.KpiValue>
        </S.KpiRightItem>
      </S.KpiRight>
    </>
  );
}
