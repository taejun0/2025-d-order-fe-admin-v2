import { useEffect, useState, useCallback } from "react";
import {
  CouponService,
  CouponDetail as CouponDetailType,
} from "@services/CouponService";

export const useCouponDetail = (couponId: number) => {
  const [detail, setDetail] = useState<CouponDetailType | null>(null);

  const fetchDetail = useCallback(async () => {
    const res = await CouponService.getCouponDetail(couponId);
    setDetail(res.data);
  }, [couponId]);

  useEffect(() => {
    fetchDetail();
  }, []);

  return { detail, refetch: fetchDetail };
};
