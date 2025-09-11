// tableView/_hooks/useTableDetail.ts
import { useCallback, useEffect, useState } from "react";
import { getTableDetail, type TableDetailData } from "../_apis/getTableDetail";

export const useTableDetail = (tableNum: number) => {
  const [tableDetail, setTableDetail] = useState<TableDetailData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchDetail = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getTableDetail(tableNum);
      setTableDetail(res.data);
      console.info("[useTableDetail] detail:", res.data);
    } catch (err: any) {
      setError(err instanceof Error ? err : new Error(String(err)));
      console.error("[useTableDetail] error:", err);
    } finally {
      setLoading(false);
    }
  }, [tableNum]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  return {
    tableDetail,
    loading,
    error,
    refetch: fetchDetail,
  };
};
