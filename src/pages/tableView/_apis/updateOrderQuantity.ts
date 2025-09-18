// tableView/_apis/updateOrderQuantity.ts
import { instance } from "@services/instance";

/** 요청 페이로드: 취소 항목 목록 */
export type CancelItem = {
  /** 명세: order_item_id 는 ordermenu_id 또는 ordersetmenu_id 중 하나 */
  order_item_id: number;
  /** 1 이상, 남은 수량 이하 */
  quantity: number;
};

export type CancelItemsPayload = {
  cancel_items: CancelItem[];
};
/** 응답 타입 (서버 구현 차이를 흡수) */
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
      // 백엔드 예시가 order_menu_id를 사용하므로 키를 포괄
      order_item_id?: number;
      order_menu_id?: number;
      ordersetmenu_id?: number;

      menu_name?: string;
      rest_quantity?: number;
      restored_stock?: number;
      refund?: number;
    }>;
  };
};

/**
 * PATCH /api/v2/booth/orders/{order_id}/
 * 명세: { cancel_items: [{ order_item_id, quantity }, ...] }
 */
export const updateOrderQuantity = async (
  orderId: number,
  items: CancelItem[]
): Promise<CancelOrderResponse> => {
  if (!Number.isFinite(orderId)) throw new Error("유효하지 않은 주문 ID입니다.");
  if (!Array.isArray(items) || items.length === 0) throw new Error("취소 항목이 비어 있습니다.");
  for (const it of items) {
    if (!Number.isFinite(it.order_item_id) || it.quantity <= 0) {
      throw new Error("취소 항목의 ID/수량이 올바르지 않습니다.");
    }
  }

  const boothId =
    localStorage.getItem("Booth-ID") ||
    localStorage.getItem("boothId") ||
    localStorage.getItem("booth_id") ||
    (import.meta as any).env?.VITE_BOOTH_ID;

  if (!boothId) {
    throw new Error("부스 선택 정보가 없습니다. Booth-ID 헤더가 필요합니다.");
  }

  const headers = { "Booth-ID": String(boothId) };

  try {
    const res = await instance.patch<CancelOrderResponse>(
      `/api/v2/booth/orders/${orderId}/`,
      { cancel_items: items },
      { headers }
    );
    return res.data;
  } catch (e: any) {
    const msg =
      e?.response?.data?.message ||
      (e?.response?.status === 403 ? "해당 부스 운영자가 아닙니다." : null) ||
      (e?.response?.status === 404 ? "해당 주문을 찾을 수 없습니다." : null) ||
      e?.message ||
      "주문 항목 취소/수량 변경에 실패했습니다.";
    throw new Error(msg);
  }
};

/** 별칭 */
export const cancelOrderItems = updateOrderQuantity;
