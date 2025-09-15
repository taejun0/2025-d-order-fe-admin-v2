// tableView/TableDetailPage.tsx
import * as S from "./TableDetailPage.styled";
import TableDetail from "./_components/detailPage/tableDetail";
import { useParams, useNavigate } from "react-router-dom";
import { useTableDetail } from "./_hooks/useTableDetail";
import { LoadingSpinner } from "./_apis/loadingSpinner";

const TableDetailPage = () => {
  const { tableNum } = useParams();
  const navigate = useNavigate();

  const parsedNum = Number(tableNum);
  const {
    detail: tableDetail,           // ✅ 이름 맞춤
    loading,
    errorMsg: error,               // ✅ 이름 맞춤
    refetch,                       // 필요시 사용
  } = useTableDetail(Number.isFinite(parsedNum) ? parsedNum : -1);

  if (!Number.isFinite(parsedNum)) {
    return <div>잘못된 테이블 번호입니다.</div>;
  }

  if (loading) return <LoadingSpinner />;
  if (error || !tableDetail) return <div>에러 발생 또는 데이터 없음</div>;

  return (
    <S.PageWrapper>
      <TableDetail
        key={tableDetail.table_num}
        data={tableDetail}
        onBack={() => navigate("/table-view")} // ✅ 뒤로가기
      />
    </S.PageWrapper>
  );
};

export default TableDetailPage;
