//헤더 api연결
import { instance } from "./instance";
import { mockBoothRevenue, delay } from "../mocks/mockData";

// 목업 모드 활성화 (항상 목업 모드로 동작)
const USE_MOCK = true;

export interface BoothRevenueResponse {
  status: string;
  message: string;
  code: number;
  data: {
    booth_id: number;
    booth_name: string;
    total_revenue: number;
  } | null;
}

/**
 * 부스 관련 API 서비스
 */
const BoothService = {
  /**
   * 부스 매출 정보를 조회합니다.
   * @returns 부스 매출 정보 응답
   */
  getBoothRevenue: async (): Promise<BoothRevenueResponse> => {
    // ========== 목업 모드 ==========
    if (USE_MOCK) {
      await delay();
      return mockBoothRevenue;
    }
    // ========== 실제 API 호출 (주석 처리) ==========
    // try {
    //   const response = await instance.get<BoothRevenueResponse>(
    //     "/api/v2/booth/revenues/"
    //   );
    //   return response.data;
    // } catch (error) {
    //   // 기본 응답 반환
    //   return {
    //     status: "error",
    //     message: "부스 정보를 불러오는데 실패했습니다.",
    //     code: 500,
    //     data: null,
    //   };
    // }
    
    try {
      const response = await instance.get<BoothRevenueResponse>(
        "/api/v2/booth/revenues/"
      );
      return response.data;
    } catch (error) {
      // 기본 응답 반환
      return {
        status: "error",
        message: "부스 정보를 불러오는데 실패했습니다.",
        code: 500,
        data: null,
      };
    }
  },
};

export default BoothService;
