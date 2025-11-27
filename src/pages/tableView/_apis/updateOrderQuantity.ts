// tableView/_apis/updateOrderQuantity.ts
import { instance } from "@services/instance";
import { delay } from "../../../mocks/mockData";

// 목업 모드 활성화 (항상 목업 모드로 동작)
const USE_MOCK = true;

/** ── 새 취소 API 스펙 ───────────────────────────────────────────────
 * PATCH /api/v2/booth/orders/cancel/
 * Headers: Authorization, Booth-ID, Content-Type: application/json
 * Body: { cancel_items: [{ type: "menu" | "set", order_item_ids: number[], quantity: number }] }
 */

export type CancelBatchItem = {
  type: "menu" | "set";
  order_item_ids: number[]; // 동일한 라인 묶음의 개별 order_item_id들
  quantity: number;         // 1 이상, 남은 수량 이하
};

export type CancelBatchPayload = {
  cancel_items: CancelBatchItem[];
};

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
      order_item_id?: number;
      order_menu_id?: number;
      ordersetmenu_id?: number;
      order_setmenu_id?: number;

      menu_name?: string;
      set_name?: string;
      rest_quantity?: number;
      restored_stock?: number;
      refund?: number;
      table_num?: number;
    }>;
  };
};

/** 새 API 호출 함수 */
export const updateOrderQuantity = async (
  batches: CancelBatchItem[]
): Promise<CancelOrderResponse> => {
  if (!Array.isArray(batches) || batches.length === 0) {
    throw new Error("취소 항목이 비어 있습니다.");
  }
  for (const b of batches) {
    if (b.type !== "menu" && b.type !== "set") {
      throw new Error('type은 "menu" 또는 "set"만 허용됩니다.');
    }
    if (!Array.isArray(b.order_item_ids) || b.order_item_ids.length === 0) {
      throw new Error("order_item_ids가 비어 있습니다.");
    }
    if (!Number.isFinite(b.quantity) || b.quantity <= 0) {
      throw new Error("quantity는 1 이상이어야 합니다.");
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

  // ========== 목업 모드 ==========
  if (USE_MOCK) {
    await delay();
    const totalRefund = batches.reduce((sum, b) => sum + (b.quantity * 10000), 0);
    return {
      status: "success",
      code: 200,
      message: "주문 항목이 취소되었습니다.",
      data: {
        order_id: 1,
        refund_total: totalRefund,
        order_amount_after: 0,
        booth_total_revenues: 1250000,
        updated_items: batches.map((b, idx) => ({
          order_item_id: b.order_item_ids[0],
          menu_name: `메뉴 ${idx + 1}`,
          rest_quantity: 0,
          restored_stock: b.quantity,
          refund: b.quantity * 10000,
          table_num: 1,
        })),
      },
    };
  }
  // ========== 실제 API 호출 (주석 처리) ==========
  // try {
  //   const res = await instance.patch<CancelOrderResponse>(
  //     `/api/v2/booth/orders/cancel/`,
  //     { cancel_items: batches },
  //     { headers: { "Booth-ID": String(boothId) } }
  //   );
  //   return res.data;
  // } catch (e: any) {
  //   const msg =
  //     e?.response?.data?.message ||
  //     (e?.response?.status === 403 ? "해당 부스 운영자가 아닙니다." : null) ||
  //     (e?.response?.status === 404 ? "해당 주문을 찾을 수 없습니다." : null) ||
  //     e?.message ||
  //     "주문 항목 취소/수량 변경에 실패했습니다.";
  //   throw new Error(msg);
  // }
  
  try {
    const res = await instance.patch<CancelOrderResponse>(
      `/api/v2/booth/orders/cancel/`,
      { cancel_items: batches },
      { headers: { "Booth-ID": String(boothId) } }
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

/** 호환 별칭 (기존 import 유지용) */
export const cancelOrderItems = updateOrderQuantity;
