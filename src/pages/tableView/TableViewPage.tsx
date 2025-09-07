// tableView/TableViewPage.tsx
import { useState } from "react";
// components 
import TableViewGrid from "./_components/tableGrid";
import TableDetail from "./_components/detailPage/tableDetail";
import * as S from "./TableViewPage.styled";
// import { useTableList } from "./_hooks/useTableList";
import { TableItem } from "./_apis/getTableList";
import { TableDetailData } from "./_apis/getTableDetail";
import { dummyTableList } from "./_mocks/dummyTableList";
import { dummyTableDetail } from "./_mocks/dummyTableDetail"; // ✅ optional
// import { LoadingSpinner } from "./_apis/loadingSpinner";

const TableViewPage = () => {
    const [selectedTableDetail, setSelectedTableDetail] =
        useState<TableDetailData | null>(null);

    // ✅ 백엔드 훅 사용 제거 (추후 복원 가능)
    // const { tableList, loading, error, refetch } = useTableList();

    // ✅ 더미 데이터로 대체
    const tableList: TableItem[] = dummyTableList;

    const handleSelectTable = async (table: TableItem) => {
        // 실제 API 호출 주석 처리
        // const detail = await getTableDetail(table.table_num);
        // setSelectedTableDetail(detail.data);

        // ✅ 더미 디테일 데이터로 대체
        setSelectedTableDetail(dummyTableDetail);
    };

    const handleBackFromDetail = () => {
        setSelectedTableDetail(null);
        // refetch(); // ✅ 주석
    };

    // ✅ 로딩, 에러 제거
    // if (loading) return <LoadingSpinner />;
    // if (error) return <div>에러 발생: {error.message}</div>;

    return (
        <S.PageWrapper>
            {selectedTableDetail ? (
                <TableDetail data={selectedTableDetail} onBack={handleBackFromDetail} />
            ) : (
                <TableViewGrid tableList={tableList} onSelectTable={handleSelectTable} />
            )}
        </S.PageWrapper>
    );
};

export default TableViewPage;


// import { useState } from "react";
// import TableViewGrid from "./_components/tableGrid";
// import TableDetail from "./_components/detailPage/tableDetail";
// import * as S from "./TableViewPage.styled";
// import { TableItem } from "./_apis/getTableList";
// import { TableDetailData, getTableDetail } from "./_apis/getTableDetail";
// import { useTableList } from "./_hooks/useTableList";
// import { LoadingSpinner } from "./_apis/loadingSpinner";

// const TableViewPage = () => {
//     const [selectedTableDetail, setSelectedTableDetail] =
//         useState<TableDetailData | null>(null);
//     const { tableList, loading, error, refetch } = useTableList();

//     const handleSelectTable = async (table: TableItem) => {
//         try {
//         const detail = await getTableDetail(table.table_num);
//         setSelectedTableDetail(detail.data);
//         } catch (err) {}
//     };

//     const handleBackFromDetail = () => {
//         setSelectedTableDetail(null);
//         refetch();
//     };

//     if (loading) return <LoadingSpinner />; // ✅ 교체
//     if (error) return <div>에러 발생: {error.message}</div>;

//     return (
//         <S.PageWrapper>
//         {selectedTableDetail ? (
//             <TableDetail data={selectedTableDetail} onBack={handleBackFromDetail} />
//         ) : (
//             <TableViewGrid
//             tableList={tableList}
//             onSelectTable={handleSelectTable}
//             />
//         )}
//         </S.PageWrapper>
//     );
// };

// export default TableViewPage;
