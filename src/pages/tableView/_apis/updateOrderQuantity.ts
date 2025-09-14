// tableView/_apis/updateOrderQuantity.ts
import { instance } from "@services/instance";

/** 요청 페이로드: 취소 항목 목록 */
export type CancelItem = {
  order_item_id: number; // ordermenu_id 또는 ordersetmenu_id
  quantity: number;      // 1 이상, 남은 수량 이하
};

export type CancelItemsPayload = {
  cancel_items: CancelItem[];
};

/** 응답 타입 */
export type CancelOrderResponse = {
  status: "success" | "fail" | "error" | string;
  code: number;
  message: string;
  data?: {
    order_id: number;
    refund_total: number;
    order_amount_after: number;
    booth_total_revenues?: number;
    updated_items: Array<{
      order_menu_id?: number; // 서버 구현에 따라 키명이 다를 수 있음
      order_setmenu_id?: number;
      menu_name?: string;
      rest_quantity?: number;
      restored_stock?: number;
      refund?: number;
    }>;
  };
};

/**
 * PATCH /api/v2/booth/orders/{order_id}/
 * 본 함수는 새 명세에 맞춰 “취소 항목”을 전달합니다.
 */
export const updateOrderQuantity = async (
  orderId: number,
  items: CancelItem[]
): Promise<CancelOrderResponse> => {
  try {
    const res = await instance.patch<CancelOrderResponse>(
      `/api/v2/booth/orders/${orderId}/`,
      { cancel_items: items } as CancelItemsPayload
    );
    return res.data;
  } catch (e: any) {
    const msg =
      e?.response?.data?.message ||
      e?.message ||
      "주문 항목 취소/수량 변경에 실패했습니다.";
    throw new Error(msg);
  }
};

/** 선택: 명시적 별칭 (가독성용) */
export const cancelOrderItems = updateOrderQuantity;
