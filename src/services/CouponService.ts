import { instance } from "./instance";

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
    const response = await instance.post<postNewCouponResponse>(
      "/api/v2/coupons/",
      data
    );
    return response.data;
  },

  getCouponList: async (): Promise<getCouponListResponse> => {
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
    try {
      const response = await instance.delete<deleteCouponResponse>(
        `/api/v2/coupons/${coupon_id}/`
      );
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },
};
