// 2025-d-order-fe-admin-v2/src/pages/tableView/_components/tableGrid.tsx
import { useMemo, useState, useEffect, useCallback } from "react";
import * as S from "./tableComponents.styled";
import { useSwipeable } from "react-swipeable";
import TableCard from "./tableCard";
import { TableItem } from "../_apis/getTableList";

interface Props {
  tableList: TableItem[];
  onSelectTable: (table: TableItem) => void;
}

interface TableOrder {
  tableNumber: number;
  totalAmount: number;
  orderedAt: string;
  orders: { menu: string; quantity: number }[];
  isOverdue: boolean;
}

const mapToTableOrder = (item: TableItem): TableOrder => ({
  tableNumber: item.table_num,
  totalAmount: item.table_price,
  orderedAt: item.created_at
    ? new Date(item.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "주문 없음",
  orders: item.orders.map((o) => ({ menu: o.menu_name, quantity: o.menu_num })),
  isOverdue: (item as any).is_overdue ?? false,
});

const chunk = <T,>(arr: T[], size: number) =>
  Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size)
  );

const ITEMS_PER_PAGE = 15; // 5 x 3 고정

const TableViewGrid: React.FC<Props> = ({ tableList, onSelectTable }) => {
  const mapped = useMemo(
    () => tableList.map((item) => ({ original: item, viewData: mapToTableOrder(item) })),
    [tableList]
  );

  const pages = useMemo(() => chunk(mapped, ITEMS_PER_PAGE), [mapped]);
  const pageCount = Math.max(1, pages.length); // 최소 1

  const [page, setPage] = useState(0);

  // 데이터가 줄어들어 현재 페이지가 초과 상태면 보정
  useEffect(() => {
    setPage((p) => (p >= pageCount ? pageCount - 1 : p));
  }, [pageCount]);

  // 키보드 ← / → 이동
  const onKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") setPage((p) => (p === 0 ? pageCount - 1 : p - 1));
      if (e.key === "ArrowRight") setPage((p) => (p === pageCount - 1 ? 0 : p + 1));
    },
    [pageCount]
  );

  useEffect(() => {
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onKey]);

  const gotoPrev = () => setPage((p) => (p === 0 ? pageCount - 1 : p - 1));
  const gotoNext = () => setPage((p) => (p === pageCount - 1 ? 0 : p + 1));

  const handlers = useSwipeable({
    onSwipedLeft: gotoNext,
    onSwipedRight: gotoPrev,
    preventScrollOnSwipe: true,
    trackMouse: true,
  });

  return (
    <S.GridWrapper {...handlers}>
      <S.GridViewport>
        {/* ✅ 페이지 수 기준으로 이동 비율 계산 */}
        <S.PagesTrack $pageCount={pageCount} $currentPage={page}>
          {pages.map((items, idx) => (
            // ✅ 각 페이지의 너비를 트랙 대비 (100 / pageCount)%로 고정
            <S.PageGrid key={idx} $pageCount={pageCount}>
              {items.map(({ original, viewData }) => (
                <div key={original.table_num} onClick={() => onSelectTable(original)}>
                  <TableCard data={viewData} />
                </div>
              ))}
            </S.PageGrid>
          ))}
        </S.PagesTrack>
      </S.GridViewport>

      <S.PageIndicatorWrapper>
        {Array.from({ length: pageCount }).map((_, i) => (
          <S.Dot key={i} $active={page === i} onClick={() => setPage(i)} />
        ))}
      </S.PageIndicatorWrapper>
    </S.GridWrapper>
  );
};

export default TableViewGrid;
