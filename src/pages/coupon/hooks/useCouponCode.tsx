import { useEffect, useState, useCallback } from "react";
import { CouponService, CouponCode } from "@services/CouponService";

export const useCouponCode = (couponId: number) => {
  const [codes, setCodes] = useState<CouponCode[]>([]);

  const fetchCodes = useCallback(async () => {
    try {
      const res = await CouponService.getCouponDetailCodeList(couponId);
      setCodes(res.data);
    } catch (err) {
      console.error("쿠폰 코드 목록 조회 실패:", err);
    }
  }, [couponId]);

  useEffect(() => {
    fetchCodes();
  }, []);

  return { codes, refetch: fetchCodes };
};
