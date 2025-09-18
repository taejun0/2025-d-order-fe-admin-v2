// src/components/Header/hooks/useBoothRevenue.ts

import { useState, useEffect } from "react";
import BoothService from "@services/BoothService";

const useBoothRevenue = () => {
  const [boothName, setBoothName] = useState<string>("부스 로딩 중...");
  const [totalRevenues, setTotalRevenues] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  // 1. 부스 이름만 가져오는 useEffect
  useEffect(() => {
    const fetchBoothName = async () => {
      console.log("🚀 [GET API] 부스 이름 조회를 시작합니다.");
      const response = await BoothService.getBoothRevenue();
      if (response.data) {
        setBoothName(response.data.booth_name);
        console.log(
          "✅ [BOOTH] 부스 이름을 성공적으로 가져왔습니다:",
          response.data.booth_name
        );
        // ❌ 여기서 매출(total_revenue)은 상태로 설정하지 않습니다.
      } else {
        setError(response.message);
        setBoothName("부스 정보 없음");
      }
    };

    fetchBoothName();
  }, []); // 이 useEffect는 마운트 시 한 번만 실행됩니다.

  // 2. 총매출만 웹소켓으로 처리하는 useEffect
  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      console.error("🔴 [REVENUE] 웹소켓 연결 실패: 액세스 토큰이 없습니다.");
      setError("로그인이 필요합니다.");
      return;
    }

    const wsUrl = `wss://api.test-d-order.store/ws/revenue/?token=${accessToken}`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("✅ [REVENUE] 총매출 웹소켓 연결 성공!");
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log("📥 [REVENUE] 새로운 매출 메시지 수신:", message);

        // 스냅샷 또는 업데이트 이벤트 발생 시 총매출 상태 업데이트
        if (
          message.type === "REVENUE_SNAPSHOT" ||
          message.type === "REVENUE_UPDATE"
        ) {
          setTotalRevenues(message.totalRevenue);
        }
      } catch (e) {
        console.error("🔴 [REVENUE] 메시지 파싱 중 오류 발생:", e);
      }
    };

    ws.onerror = (error) => {
      console.error("🔴 [REVENUE] 웹소켓 에러 발생:", error);
      setError("매출 실시간 업데이트 중 오류가 발생했습니다.");
    };

    ws.onclose = (event) => {
      console.log(
        `⚪️ [REVENUE] 웹소켓 연결이 종료되었습니다. 코드: ${event.code}`
      );
    };

    // 컴포넌트 언마운트 시 웹소켓 연결 종료
    return () => {
      console.log("🧹 [REVENUE] 총매출 웹소켓 연결을 종료합니다.");
      ws.close();
    };
  }, []); // 이 useEffect도 마운트 시 한 번만 실행됩니다.

  return { boothName, totalRevenues, error };
};

export default useBoothRevenue;

// // src/components/header/hooks/useBoothRevenue.ts
// import { useState, useEffect, useCallback } from "react";
// import { useLocation } from "react-router-dom";
// import BoothService from "@services/BoothService";

// interface UseBoothRevenueReturn {
//   boothName: string;
//   totalRevenues: number;
//   loading: boolean;
//   error: Error | null;
//   refetch: () => Promise<void>;
// }

// /**
//  * 부스 매출 정보를 관리하는 훅
//  */
// const useBoothRevenue = (): UseBoothRevenueReturn => {
//   const [boothName, setBoothName] = useState<string>("");
//   const [totalRevenues, setTotalRevenues] = useState<number>(0);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<Error | null>(null);
//   const location = useLocation(); // 현재 라우터 경로 가져오기

//   const refetch = useCallback(async (): Promise<void> => {
//     try {
//       setLoading(true);
//       setError(null);

//       const response = await BoothService.getBoothRevenue();

//       if (response.status === "success" && response.data) {
//         setBoothName(response.data.booth_name);
//         setTotalRevenues(response.data.total_revenue);
//       } else {
//         setError(
//           new Error(response.message || "데이터를 불러오는데 실패했습니다.")
//         );
//       }
//     } catch (err) {
//       setError(
//         err instanceof Error
//           ? err
//           : new Error("알 수 없는 오류가 발생했습니다.")
//       );
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     refetch();
//   }, [refetch, location.pathname]); // 라우터 경로가 변경될 때마다 refetch 실행

//   return {
//     boothName,
//     totalRevenues,
//     loading,
//     error,
//     refetch,
//   };
// };

// export default useBoothRevenue;
