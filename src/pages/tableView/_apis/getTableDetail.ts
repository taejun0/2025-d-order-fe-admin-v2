// tableView/_apis/getTableDetail.ts
import { instance } from "@services/instance";

/** ── 서버 원형 타입 (명세 + 과거 오타/변형 허용) ───────────────────── */
type RawOrder = {
  order_id?: number;
  ordermenu_id?: number;     // ✅ 새 명세의 주문 항목 PK
  order_menu_id?: number;    // 과거 변형
  ordersetmenu_id?: number;  // 과거 변형
  order_setmenu_id?: number; // 과거 변형
  order_item_id?: number;    // 과거 변형

  menu_image?: string | null;
  menu_name?: string;
  price?: number;            // ✅ 새 명세의 단가
  menu_price?: number;       // 과거 변형
  quantity?: number;         // ✅ 새 명세의 수량
  menu_num?: number;         // 과거 변형
};

type RawTableDetail = {
  table_num?: number;
  table_amount?: number;
  table_price?: number;      // 과거 변형
  table_status?: "activate" | "out" | string; // 새 명세: activate | out
  created_at?: string | null;
  orders?: RawOrder[];
};

type RawResponse =
  | {
      status?: "success" | string;
      message?: string;
      code?: number;
      data?: RawTableDetail | null;
    }
  | {
      // 오류 바디 (401/404/500)
      status: number; // 401 | 404 | 500
      message: string;
      data: null;
    };

/** ── 정규화된 UI 타입 ─────────────────────────────────────────────── */
export type OrderDetail = {
  menu_image: string | null;
  menu_name: string;
  price: number;            // 단가
  quantity: number;         // 수량
  order_id?: number;        // 주문 PK
  order_item_id?: number;   // ✅ 주문항목 PK (= ordermenu_id ...)
};

export type TableDetailData = {
  table_num: number;
  table_amount: number;
  table_status: "activate" | "out" | "unknown";
  created_at: string | null;
  orders: OrderDetail[];
};

export type TableDetailResponse = {
  status: string;
  message: string;
  code: number;
  data: TableDetailData;
};

/** ── 정규화 함수 ─────────────────────────────────────────────────── */
const normalize = (raw: RawTableDetail): TableDetailData => {
  const table_num = raw.table_num ?? 0;

  const table_amount =
    typeof raw.table_amount === "number"
      ? raw.table_amount
      : typeof raw.table_price === "number"
      ? raw.table_price
      : 0;

  // 새 명세는 "activate" | "out" 이지만, 방어적으로 처리
  const statusRaw = (raw.table_status ?? "").toString().toLowerCase();
  const table_status: TableDetailData["table_status"] =
    statusRaw === "activate" || statusRaw === "out" ? (statusRaw as any) : "unknown";

  const orders: OrderDetail[] = Array.isArray(raw.orders)
    ? raw.orders.map((o) => {
        // ✅ 다양한 키로 올 수 있는 항목 PK를 하나로 통합 (새 명세: ordermenu_id)
        const order_item_id =
          typeof o.order_item_id === "number" ? o.order_item_id :
          typeof o.ordermenu_id === "number" ? o.ordermenu_id :
          typeof o.order_menu_id === "number" ? o.order_menu_id :
          typeof o.ordersetmenu_id === "number" ? o.ordersetmenu_id :
          typeof o.order_setmenu_id === "number" ? o.order_setmenu_id :
          undefined;

        return {
          menu_image:
            typeof o?.menu_image === "string" &&
            o.menu_image.trim() !== "" &&
            o.menu_image.trim().toLowerCase() !== "null"
              ? o.menu_image
              : null,
          menu_name: o.menu_name ?? "(이름 없음)",
          price:
            typeof o.price === "number"
              ? o.price
              : typeof o.menu_price === "number"
              ? o.menu_price
              : 0,
          quantity:
            typeof o.quantity === "number"
              ? o.quantity
              : typeof o.menu_num === "number"
              ? o.menu_num
              : 1,
          order_id: typeof o.order_id === "number" ? o.order_id : undefined,
          order_item_id,
        };
      })
    : [];

  return {
    table_num,
    table_amount,
    table_status,
    created_at: raw.created_at ?? null,
    orders,
  };
};

/** ── API 함수 ────────────────────────────────────────────────────── */
export const getTableDetail = async (tableNum: number): Promise<TableDetailResponse> => {
  try {
    const res = await instance.get<RawResponse>(`/api/v2/booth/tables/${tableNum}/`);
    const body = res.data as RawResponse;

    // 오류 바디 케이스 (status 가 숫자)
    if (typeof (body as any)?.status === "number") {
      const errMsg =
        (body as any)?.message ||
        ((body as any)?.status === 401
          ? "로그인이 필요합니다."
          : (body as any)?.status === 404
          ? "존재하지 않는 부스입니다."
          : "서버 내부 오류가 발생했습니다.");
      throw new Error(errMsg);
    }

    // 성공 바디 케이스
    if (!("data" in body) || !body.data) {
      throw new Error((body as any)?.message ?? "데이터가 비어 있습니다.");
    }

    const data = normalize(body.data);

    return {
      status: String(body.status ?? "success"),
      message: body.message ?? "테이블 상세 조회 성공",
      code: Number(body.code ?? 200),
      data,
    };
  } catch (e: any) {
    const serverMsg =
      e?.response?.data?.message ??
      e?.message ??
      "테이블 상세 조회 실패";
    throw new Error(serverMsg);
  }
};
