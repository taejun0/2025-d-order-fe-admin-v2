import * as S from './DashboardPage.styled';
import { useDashboard } from './_hooks/useDashboard';
import KpiSection from './_components/KpiSection';
import Top3Section from './_components/Top3Section';
import LowStockSection from './_components/LowStockSection';
import WaitPanel from './_components/WaitPanel';

const DashboardPage = () => {
  const { data, loading } = useDashboard(20000);

  return (
    <S.Page>
      {/* 로딩/에러 상태는 UI에 표시만 */}
      {loading && <div>로딩 중…</div>}

      {/* 실제 화면 */}
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
