import * as S from './DashboardPage.styled';
import KpiSection from './_components/KpiSection';
import Top3Section from './_components/Top3Section';
import LowStockSection from './_components/LowStockSection';
import WaitPanel from './_components/WaitPanel';

import { useDashboard } from './_hooks/useDashboard';
import { useStatisticsWS } from './_hooks/useStatisticsWS';
import { mapDashboardResponse } from './_services/dashboard.mapper';

const DashboardPage = () => {
  // REST 1회 (WS 있으니 pollMs=0 권장)
  const { data, loading, err, reload, setData } = useDashboard(0);

  // WS 연결: 페이지 마운트 시 시작
  useStatisticsWS({
    onInit: (fullRaw) => {
      // WS는 REST와 동일 구조라 했으니 래핑해서 매퍼에 넣는다
      const mapped = mapDashboardResponse({ data: fullRaw } as any);
      setData(mapped);
    },
    onPatch: (patch) =>
      setData((prev) => (prev ? { ...prev, ...patch } : (patch as any))),
    onError: (code, message) => {
      if (code === 4001) {
        console.error('WS 인증 실패:', message);
        // TODO: 로그인 페이지 이동/토큰 재발급 등 처리
      } else {
        console.error('WS 오류:', code, message);
      }
    },
  });

  // --- 가드: 에러 우선 노출
  if (err) {
    return (
      <S.Page>
        <div style={{ color: 'red' }}>불러오기 실패: {err.message}</div>
        <button onClick={reload} disabled={loading}>
          다시 시도
        </button>
      </S.Page>
    );
  }

  // --- 가드: 초기 로딩 (data는 mock 기본값이지만, 명확히 분기)
  if (loading && !data) {
    return (
      <S.Page>
        <div>로딩 중…</div>
      </S.Page>
    );
  }

  // --- 정상 렌더
  return (
    <S.Page>
      {/* 초기 REST가 끝났지만 WS 동기 중일 수 있으니 가벼운 상태 표시 */}
      {loading && <div>초기화 중…</div>}

      <KpiSection kpi={data.kpi} />

      <S.LeftCol>
        <Top3Section items={data.top3} />
        <LowStockSection items={data.lowStock} />
      </S.LeftCol>

      <WaitPanel stat={data.wait} />
    </S.Page>
  );
};

export default DashboardPage;
