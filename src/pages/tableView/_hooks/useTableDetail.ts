// tableView/_hooks/useTableDetail.ts
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getTableDetail,
  TableDetailData,
} from "../_apis/getTableDetail";
import {
  resetTable as apiResetTable,
  ResetTableResponse,
} from "../_apis/resetTable";
import {
  updateOrderQuantity as apiCancelItems,
  CancelItem,
  CancelOrderResponse,
} from "../_apis/updateOrderQuantity";

type Status = "idle" | "loading" | "success" | "error";

export const useTableDetail = (tableNum: number) => {
  const [detail, setDetail] = useState<TableDetailData | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchDetail = useCallback(async () => {
    setStatus("loading");
    setErrorMsg(null);
    try {
      const res = await getTableDetail(tableNum);

      // ⬇️ data null 가드
      if (!res || !res.data) {
        throw new Error("테이블 상세 데이터가 비어 있습니다.");
      }

      setDetail(res.data); // 이제 non-null
      setStatus("success");
    } catch (e: any) {
      setErrorMsg(e?.message ?? "테이블 상세 조회 중 오류가 발생했습니다.");
      setStatus("error");
    }
  }, [tableNum]);

  useEffect(() => {
    if (Number.isFinite(tableNum)) fetchDetail();
  }, [fetchDetail, tableNum]);

  /** 테이블 리셋 */
  const resetTable = useCallback(async (): Promise<ResetTableResponse> => {
    const res = await apiResetTable(tableNum);
    // 로컬 상태 갱신 (성공 시)
    if (res?.status === "success" && res?.data) {
      setDetail((prev) =>
        prev
          ? {
              ...prev,
              table_amount: 0,
              table_status:
                res.data.table_status === "activate" || res.data.table_status === "out"
                  ? res.data.table_status
                  : "out",
              orders: [],
            }
          : prev
      );
    }
    return res;
  }, [tableNum]);

  /**
   * 주문 항목 취소 / 수량 감소
   * - orderId: 주문 PK
   * - items: [{ order_item_id, quantity }]
   */
  const cancelItems = useCallback(
    async (orderId: number, items: CancelItem[]): Promise<CancelOrderResponse> => {
      const res = await apiCancelItems(orderId, items);

      if (res?.status === "success" && res?.data) {
        const { order_amount_after, updated_items } = res.data;

        setDetail((prev) => {
          if (!prev) return prev;

          // updated_items 기반으로 로컬 주문 목록 갱신
          const nextOrders = [...prev.orders];

          // 서버가 rest_quantity(남은 수량)를 주는 경우 반영
          if (Array.isArray(updated_items)) {
            updated_items.forEach((u) => {
              // 주의: 서버 키명이 order_menu_id 또는 order_setmenu_id 등으로 다를 수 있음
              const updatedId =
                (u as any).order_menu_id ?? (u as any).order_setmenu_id;

              // 우리 UI쪽은 주문항목에 별도 ID가 없으므로,
              // 보통은 "메뉴명 + 가격" 등으로 매칭하거나,
              // 테이블 상세 API가 order_item_id를 함께 내려주도록 BE에 요청하는 것이 이상적.
              // 임시: menu_name 기반 느슨한 매칭 (동명이인 이슈 있을 수 있음)
              if (u.menu_name) {
                const idx = nextOrders.findIndex(
                  (o) => o.menu_name === u.menu_name
                );
                if (idx >= 0) {
                  const restQty =
                    typeof u.rest_quantity === "number" ? u.rest_quantity : undefined;
                  if (typeof restQty === "number") {
                    if (restQty <= 0) {
                      nextOrders.splice(idx, 1); // 수량 0이면 제거
                    } else {
                      nextOrders[idx] = {
                        ...nextOrders[idx],
                        quantity: restQty,
                      };
                    }
                  }
                }
              }

              // 만약 상세 응답이 order_item_id를 포함하도록 바뀌면,
              // 위 매칭 로직을 item_id 기반으로 치환하면 정확도가 높아짐.
              void updatedId; // (lint 억제용)
            });
          }

          return {
            ...prev,
            table_amount: typeof order_amount_after === "number"
              ? order_amount_after
              : prev.table_amount,
            orders: nextOrders,
          };
        });
      }

      return res;
    },
    []
  );

  const hasOrders = useMemo(() => (detail?.orders?.length ?? 0) > 0, [detail]);

  return {
    detail,
    loading: status === "loading",
    errorMsg,
    hasOrders,
    refetch: fetchDetail,
    resetTable,
    cancelItems,
  };
};
