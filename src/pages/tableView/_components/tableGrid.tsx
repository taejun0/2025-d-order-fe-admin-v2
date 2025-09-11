// tableView/_components/tableGrid.tsx
import { useMemo, useState, useEffect, useCallback } from "react";
import * as S from "./tableComponents.styled";
import { useSwipeable } from "react-swipeable";
import TableCard from "./tableCard";
import { TableItem } from "../_apis/getTableList";
import { useTableStatus } from "../_hooks/useTableStatus";

interface Props {
  tableList: TableItem[];
  onSelectTable: (table: TableItem) => void;
}

interface TableOrder {
  tableNumber: number;
  totalAmount: number;
  orderedAt: string;
  orders: { menu: string; quantity: number }[];
  isOverdue: boolean; // ✅ 이 값을 expired로 대체
}

const formatTime = (iso: string | null) => {
  if (!iso) return "주문 없음";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "주문 없음";
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const chunk = <T,>(arr: T[], size: number) =>
  Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size)
  );

const ITEMS_PER_PAGE = 15;

const TableViewGrid: React.FC<Props> = ({ tableList, onSelectTable }) => {
  // ✅ 웹소켓으로부터 expired 상태를 받는다
  const { expiredMap } = useTableStatus();

  const mapped = useMemo(
    () =>
      tableList.map((item) => {
        const viewData: TableOrder = {
          tableNumber: item.tableNum,
          totalAmount: item.amount,
          orderedAt: formatTime(item.createdAt),
          orders: (item.latestOrders ?? []).map((o) => ({
            menu: o.name,
            quantity: o.qty,
          })),
          // ✅ 핵심: isOverdue ← websocket의 expired
          isOverdue: !!expiredMap[item.tableNum],
        };
        return { original: item, viewData };
      }),
    [tableList, expiredMap]
  );

  const pages = useMemo(() => chunk(mapped, ITEMS_PER_PAGE), [mapped]);
  const pageCount = Math.max(1, pages.length);

  const [page, setPage] = useState(0);

  useEffect(() => {
    setPage((p) => (p >= pageCount ? pageCount - 1 : p));
  }, [pageCount]);

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
        <S.PagesTrack $pageCount={pageCount} $currentPage={page}>
          {pages.map((items, idx) => (
            <S.PageGrid key={idx} $pageCount={pageCount}>
              {items.map(({ original, viewData }) => (
                <div key={original.tableNum} onClick={() => onSelectTable(original)}>
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
