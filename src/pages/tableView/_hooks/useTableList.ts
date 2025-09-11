// tableView/_hooks/useTableList.ts
import { useCallback, useEffect, useMemo, useState } from "react";
import { getTableList, type TableItem } from "../_apis/getTableList";

export type UseTableListState = {
  loading: boolean;
  error: string | null;
  tables: TableItem[];
  refetch: () => Promise<void>;
  activateCount: number;
  totalRevenue: number;
};

export function useTableList(): UseTableListState {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tables, setTables] = useState<TableItem[]>([]);

  const fetchOnce = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getTableList();
      setTables(result.data);
      console.info("[useTableList] tables:", result.data);
    } catch (e: any) {
      const msg = e?.message ?? "요청 실패";
      setError(msg);
      console.error("[useTableList] fetch error:", msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOnce();
  }, [fetchOnce]);

  const refetch = fetchOnce;

  const activateCount = useMemo(
    () => tables.filter((t) => t.status === "activate").length,
    [tables]
  );
  const totalRevenue = useMemo(
    () => tables.reduce((sum, t) => sum + (t.amount ?? 0), 0),
    [tables]
  );

  return { loading, error, tables, refetch, activateCount, totalRevenue };
}
