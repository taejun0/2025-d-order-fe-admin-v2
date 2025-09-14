// tableView/_hooks/useTableDetail.ts
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getTableDetail,
  type TableDetailData,
  type OrderDetail,
} from "../_apis/getTableDetail";

import {
  updateOrderQuantity as apiCancelItems,
  type CancelItem,
  type CancelOrderResponse,
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
      if (!res || !res.data) {
        throw new Error("테이블 상세 데이터가 비어 있습니다.");
      }
      setDetail(res.data);
      setStatus("success");
    } catch (e: any) {
      setErrorMsg(e?.message ?? "테이블 상세 조회 중 오류가 발생했습니다.");
      setStatus("error");
    }
  }, [tableNum]);

  useEffect(() => {
    if (Number.isFinite(tableNum)) fetchDetail();
  }, [fetchDetail, tableNum]);

  const cancelItems = useCallback(
    async (orderId: number, items: CancelItem[]): Promise<CancelOrderResponse> => {
      const res = await apiCancelItems(orderId, items);

      if (res?.status === "success" && res?.data) {
        const { order_amount_after, updated_items } = res.data;

        setDetail((prev) => {
          if (!prev) return prev;

          const nextOrders: OrderDetail[] = [...prev.orders];

          // ...생략...
          if (Array.isArray(updated_items)) {
            updated_items.forEach((u: any) => {
              // ✅ 서버가 내려주는 항목 식별자 후보 (ordermenu_id 추가)
              const uItemId: number | undefined =
                typeof u.order_item_id === "number" ? u.order_item_id :
                typeof u.ordermenu_id === "number" ? u.ordermenu_id :
                typeof u.order_menu_id === "number" ? u.order_menu_id :
                typeof u.order_setmenu_id === "number" ? u.order_setmenu_id :
                undefined;

              const uOrderId: number | undefined =
                typeof u.order_id === "number" ? u.order_id : undefined;

              const uMenuName: string | undefined =
                typeof u.menu_name === "string" ? u.menu_name : undefined;

              // 1순위: order_item_id(=ordermenu_id 등)로 매칭
              let idx = -1;
              if (uItemId != null) {
                idx = nextOrders.findIndex((o) => o.order_item_id === uItemId);
              }
              // 2순위: (order_id + menu_name) 조합
              if (idx < 0 && uOrderId != null && uMenuName) {
                idx = nextOrders.findIndex(
                  (o) => o.order_id === uOrderId && o.menu_name === uMenuName
                );
              }
              // 3순위: order_id만
              if (idx < 0 && uOrderId != null) {
                idx = nextOrders.findIndex((o) => o.order_id === uOrderId);
              }
              // 4순위: menu_name만 (충돌 가능성 주의)
              if (idx < 0 && uMenuName) {
                idx = nextOrders.findIndex((o) => o.menu_name === uMenuName);
              }

              if (idx >= 0) {
                const restQty =
                  typeof u.rest_quantity === "number" ? u.rest_quantity : undefined;

                if (typeof restQty === "number") {
                  if (restQty <= 0) {
                    nextOrders.splice(idx, 1);
                  } else {
                    nextOrders[idx] = {
                      ...nextOrders[idx],
                      quantity: restQty,
                    };
                  }
                }
              }
            });
          }


          return {
            ...prev,
            table_amount:
              typeof order_amount_after === "number"
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
    // resetTable,
    cancelItems,
  };
};
