import {
  CouponService,
  postNewCouponRequest,
  Coupon,
} from "@services/CouponService";
import { useCouponList } from "./useCouponList";

export const useCreateCoupon = () => {
  const { refetch } = useCouponList();

  const create = async (data: postNewCouponRequest): Promise<Coupon> => {
    const res = await CouponService.postNewCoupon(data);
    await refetch();
    return res.data;
  };

  return { create };
};
