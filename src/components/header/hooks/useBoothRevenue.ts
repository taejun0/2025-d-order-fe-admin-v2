// src/components/header/hooks/useBoothRevenue.ts
import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import BoothService from "@services/BoothService";

interface UseBoothRevenueReturn {
  boothName: string;
  totalRevenues: number;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * 부스 매출 정보를 관리하는 훅
 */
const useBoothRevenue = (): UseBoothRevenueReturn => {
  const [boothName, setBoothName] = useState<string>("");
  const [totalRevenues, setTotalRevenues] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const location = useLocation(); // 현재 라우터 경로 가져오기

  const refetch = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const response = await BoothService.getBoothRevenue();

      if (response.status === "success" && response.data) {
        setBoothName(response.data.booth_name);
        setTotalRevenues(response.data.total_revenue);
      } else {
        setError(
          new Error(response.message || "데이터를 불러오는데 실패했습니다.")
        );
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err
          : new Error("알 수 없는 오류가 발생했습니다.")
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch, location.pathname]); // 라우터 경로가 변경될 때마다 refetch 실행

  return {
    boothName,
    totalRevenues,
    loading,
    error,
    refetch,
  };
};

export default useBoothRevenue;
