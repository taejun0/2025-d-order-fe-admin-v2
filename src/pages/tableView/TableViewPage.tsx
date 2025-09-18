// tableView/TableViewPage.tsx
import { useNavigate } from "react-router-dom";
import TableViewGrid from "./_components/tableGrid";
import * as S from "./TableViewPage.styled";
import { useTableList } from "./_hooks/useTableList";
import { TableItem } from "./_apis/getTableList";
import { buildTableDetailPath } from "@constants/routeConstants";
import { LoadingSpinner } from "./_apis/loadingSpinner"; // ✅ 스피너 가져오기

const TableViewPage = () => {
    const navigate = useNavigate();
    const { tables: tableList, loading, error /*, refetch */ } = useTableList();

    const handleSelectTable = (table: TableItem) => {
        navigate(buildTableDetailPath(table.tableNum));
    };

    if (loading) {
        // ✅ 로딩 중에는 스피너 사용
        return (
        <S.PageWrapper aria-busy="true" aria-live="polite" role="status">
            <LoadingSpinner />
        </S.PageWrapper>
        );
    }

    if (error) {
        return (
        <S.PageWrapper>
            <div style={{ padding: 24 }}>에러 발생: {error}</div>
        </S.PageWrapper>
        );
    }

    return (
        <S.PageWrapper>
        <TableViewGrid tableList={tableList} onSelectTable={handleSelectTable} />
        </S.PageWrapper>
    );
};

export default TableViewPage;
