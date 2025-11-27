import { instance } from "./instance";
import { mockCoupons, mockCouponDetail, mockCouponCodes, delay } from "../mocks/mockData";

// 목업 모드 활성화 (항상 목업 모드로 동작)
const USE_MOCK = true;

export interface postNewCouponRequest {
  coupon_name: string;
  coupon_description: string;
  discount_type: "amount" | "percent";
  discount_value: number;
  quantity: number;
}
export interface postNewCouponResponse {
  status: string;
  code: number;
  data: Coupon;
}
//couponList get
export interface Coupon {
  coupon_id: number;
  coupon_name: string;
  discount_type: "amount" | "percent";
  discount_value: number;
  is_used: boolean;
  created_at: string;
  total_count: number;
  remaining_count: number;
}

export interface getCouponListResponse {
  status: string;
  code: number;
  data: Coupon[];
}
//couponDetail
export interface CouponDetail {
  coupon_id: number;
  coupon_name: string;
  coupon_description: string;
  discount_type: "amount" | "percent";
  discount_value: number;
  quantity: number;
  used_count: number;
  unused_count: number;
  created_at: string;
  total_count: number;
  remaining_count: number;
}
export interface getCouponDetailResponse {
  status: string;
  code: number;
  data: CouponDetail;
}
//
export interface CouponCode {
  code: string;
  issued_to_table: string | null;
  is_used: boolean;
  used_at: string | null;
}

export interface getCouponCodeListResponse {
  status: string;
  code: number;
  data: CouponCode[];
}
//
export interface deleteCouponResponse {
  status: string;
  code: number;
  message: string;
}

export const CouponService = {
  postNewCoupon: async (
    data: postNewCouponRequest
  ): Promise<postNewCouponResponse> => {
    // ========== 목업 모드 ==========
    if (USE_MOCK) {
      await delay();
      const newCoupon: Coupon = {
        coupon_id: mockCoupons.length + 1,
        coupon_name: data.coupon_name,
        discount_type: data.discount_type,
        discount_value: data.discount_value,
        is_used: false,
        created_at: new Date().toISOString(),
        total_count: data.quantity,
        remaining_count: data.quantity,
      };
      return {
        status: "success",
        code: 200,
        data: newCoupon,
      };
    }
    // ========== 실제 API 호출 (주석 처리) ==========
    // const response = await instance.post<postNewCouponResponse>(
    //   "/api/v2/coupons/",
    //   data
    // );
    // return response.data;
    
    const response = await instance.post<postNewCouponResponse>(
      "/api/v2/coupons/",
      data
    );
    return response.data;
  },

  getCouponList: async (): Promise<getCouponListResponse> => {
    // ========== 목업 모드 ==========
    if (USE_MOCK) {
      await delay();
      return {
        status: "success",
        code: 200,
        data: mockCoupons,
      };
    }
    // ========== 실제 API 호출 (주석 처리) ==========
    // try {
    //   const response = await instance.get<getCouponListResponse>(
    //     "/api/v2/coupons/"
    //   );
    //   return response.data;
    // } catch (error: any) {
    //   throw error;
    // }
    
    try {
      const response = await instance.get<getCouponListResponse>(
        "/api/v2/coupons/"
      );
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  getCouponDetail: async (
    coupon_id: number
  ): Promise<getCouponDetailResponse> => {
    // ========== 목업 모드 ==========
    if (USE_MOCK) {
      await delay();
      return {
        status: "success",
        code: 200,
        data: mockCouponDetail,
      };
    }
    // ========== 실제 API 호출 (주석 처리) ==========
    // try {
    //   const response = await instance.get<getCouponDetailResponse>(
    //     `/api/v2/coupons/${coupon_id}/`
    //   );
    //   return response.data;
    // } catch (error: any) {
    //   throw error;
    // }
    
    try {
      const response = await instance.get<getCouponDetailResponse>(
        `/api/v2/coupons/${coupon_id}/`
      );
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  getCouponDetailCodeList: async (
    coupon_id: number
  ): Promise<getCouponCodeListResponse> => {
    // ========== 목업 모드 ==========
    if (USE_MOCK) {
      await delay();
      return {
        status: "success",
        code: 200,
        data: mockCouponCodes,
      };
    }
    // ========== 실제 API 호출 (주석 처리) ==========
    // try {
    //   const response = await instance.get<getCouponCodeListResponse>(
    //     `/api/v2/coupons/${coupon_id}/codes/`
    //   );
    //   return response.data;
    // } catch (error: any) {
    //   throw error;
    // }
    
    try {
      const response = await instance.get<getCouponCodeListResponse>(
        `/api/v2/coupons/${coupon_id}/codes/`
      );
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  deleteCoupon: async (coupon_id: number): Promise<deleteCouponResponse> => {
    // ========== 목업 모드 ==========
    if (USE_MOCK) {
      await delay();
      return {
        status: "success",
        code: 200,
        message: "쿠폰이 삭제되었습니다.",
      };
    }
    // ========== 실제 API 호출 (주석 처리) ==========
    // try {
    //   const response = await instance.delete<deleteCouponResponse>(
    //     `/api/v2/coupons/${coupon_id}/`
    //   );
    //   return response.data;
    // } catch (error: any) {
    //   throw error;
    // }
    
    try {
      const response = await instance.delete<deleteCouponResponse>(
        `/api/v2/coupons/${coupon_id}/`
      );
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },
  getDownCouponExcel: async (coupon_id: number) => {
    // ========== 목업 모드 ==========
    if (USE_MOCK) {
      await delay();
      console.log(`[MOCK] 쿠폰 ${coupon_id} 엑셀 다운로드 시뮬레이션`);
      return;
    }
    // ========== 실제 API 호출 (주석 처리) ==========
    // const res = await instance.get(
    //   `/api/v2/coupons/${coupon_id}/codes/download/`,
    //   {
    //     responseType: "blob",
    //   }
    // );
    // const getTodayString = () => {
    //   const now = new Date();
    //   return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(
    //     2,
    //     "0"
    //   )}${String(now.getDate()).padStart(2, "0")}`;
    // };
    // const cd = res.headers["content-disposition"] || "";
    // const m =
    //   cd.match(/filename\*?=(?:UTF-8'')?"?([^";]+)"?/i) ||
    //   cd.match(/filename="?([^";]+)"?/i);
    // let filename = `coupons_${coupon_id}_${getTodayString()}.xlsx`;
    // if (m?.[1]) {
    //   try {
    //     filename = decodeURIComponent(m[1]);
    //   } catch {
    //     filename = m[1];
    //   }
    // }
    // const blob = new Blob([res.data], {
    //   type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    // });
    // const url = URL.createObjectURL(blob);
    // const a = document.createElement("a");
    // a.href = url;
    // a.download = filename;
    // a.click();
    // a.remove();
    // setTimeout(() => URL.revokeObjectURL(url), 1000);
    
    const res = await instance.get(
      `/api/v2/coupons/${coupon_id}/codes/download/`,
      {
        responseType: "blob",
      }
    );

    const getTodayString = () => {
      const now = new Date();
      return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(
        2,
        "0"
      )}${String(now.getDate()).padStart(2, "0")}`;
    };

    const cd = res.headers["content-disposition"] || "";
    const m =
      cd.match(/filename\*?=(?:UTF-8'')?"?([^";]+)"?/i) ||
      cd.match(/filename="?([^";]+)"?/i);

    let filename = `coupons_${coupon_id}_${getTodayString()}.xlsx`;
    if (m?.[1]) {
      try {
        filename = decodeURIComponent(m[1]);
      } catch {
        filename = m[1];
      }
    }

    const blob = new Blob([res.data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    a.remove();

    setTimeout(() => URL.revokeObjectURL(url), 1000);
  },
};
