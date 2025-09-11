// tableView/TableDetailPage.tsx
import * as S from './TableDetailPage.styled';
import TableDetail from './_components/detailPage/tableDetail';
import { useParams } from 'react-router-dom';
import { useTableDetail } from './_hooks/useTableDetail';
import { LoadingSpinner } from './_apis/loadingSpinner';

const TableDetailPage = () => {
  const { tableNum } = useParams();
  const { tableDetail, loading, error } = useTableDetail(Number(tableNum));

  if (loading) return <LoadingSpinner />;
  if (error || !tableDetail) return <div>에러 발생 또는 데이터 없음</div>;

  return (
    <S.PageWrapper>
      <TableDetail key={tableDetail.table_num} data={tableDetail} />
    </S.PageWrapper>
  );
};

export default TableDetailPage;
