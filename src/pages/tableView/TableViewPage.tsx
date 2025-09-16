// tableView/TableViewPage.tsx
import { useNavigate } from "react-router-dom";
import TableViewGrid from "./_components/tableGrid";
import * as S from "./TableViewPage.styled";
import { useTableList } from "./_hooks/useTableList";
import { TableItem } from "./_apis/getTableList";
import { buildTableDetailPath } from "@constants/routeConstants";

const TableViewPage = () => {
    const navigate = useNavigate();
    const { tables: tableList, loading, error, /*refetch*/ } = useTableList();

    const handleSelectTable = (table: TableItem) => {
        navigate(buildTableDetailPath(table.tableNum));
    };

    if (loading) return <div style={{ padding: 24 }}>Loading...</div>;
    if (error) return <div style={{ padding: 24 }}>에러 발생: {error}</div>;

    return (
        <S.PageWrapper>
        <TableViewGrid tableList={tableList} onSelectTable={handleSelectTable} />
        </S.PageWrapper>
    );
};

export default TableViewPage;
