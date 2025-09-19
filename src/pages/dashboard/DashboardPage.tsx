// DashboardPage.tsx
import * as S from './DashboardPage.styled';
import KpiSection from './_components/KpiSection';
import Top3Section from './_components/Top3Section';
import LowStockSection from './_components/LowStockSection';
import WaitPanel from './_components/WaitPanel';

import { useDashboard } from './_hooks/useDashboard';
import useStatisticsWSLite from './_hooks/useStatisticsWS';
import {
  mapDashboardResponse,
  mapDashboardPatch,
  mergeDashboard,
} from './_services/dashboard.mapper';

const toMapped = (payload: any) => {
  if (
    payload &&
    typeof payload === 'object' &&
    'status' in payload &&
    'data' in payload
  ) {
    return mapDashboardResponse(payload);
  }
  return mapDashboardResponse({ data: payload });
};

const DashboardPage = () => {
  const { data, loading, err, reload, setData } = useDashboard(0);

  useStatisticsWSLite({
    onInit: (fullRaw) => setData(toMapped(fullRaw)),
    onPatch: (patchRaw) =>
      setData((prev) => mergeDashboard(prev, mapDashboardPatch(patchRaw))),
    onError: (code, message) => {
      if (code === 4001) {
        console.error('WS 인증 실패:', message);
      } else {
        console.error('WS 오류:', code, message);
      }
    },
  });

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

  if (!data) {
    return (
      <S.Page>
        <div>로딩 중…</div>
      </S.Page>
    );
  }

  return (
    <S.Page>
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
