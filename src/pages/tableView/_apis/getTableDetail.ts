// tableView/_apis/getTableDetail.ts
import { instance } from "@services/instance";

type RawOrder = {
  type?: "menu" | "setmenu" | string;

  // menu 계열
  menu_id?: number;
  menu_name?: string;
  menu_price?: number;
  menu_image?: string | null;

  // ✅ setmenu 계열 (추가)
  set_id?: number;
  set_name?: string;
  set_price?: number;
  set_image?: string | null;

  // 공통/과거 변형
  fixed_price?: number;
  price?: number;
  quantity?: number;
  menu_num?: number;

  order_id?: number;
  ordermenu_id?: number;
  order_menu_id?: number;
  ordersetmenu_id?: number;
  order_setmenu_id?: number;
  order_item_id?: number;
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
        // ✅ 주문항목 PK(취소 요청용): 기존 후보 유지
        const order_item_id =
          typeof o.order_item_id === "number" ? o.order_item_id :
          typeof o.ordermenu_id === "number" ? o.ordermenu_id :
          typeof o.order_menu_id === "number" ? o.order_menu_id :
          typeof o.ordersetmenu_id === "number" ? o.ordersetmenu_id :
          typeof o.order_setmenu_id === "number" ? o.order_setmenu_id :
          undefined; // ⚠ set_id/menu_id는 '상품' ID라 취소 PK로 쓰면 안됨

        // ✅ 이름: menu_name → set_name 순서로 사용
        const name =
          typeof o.menu_name === "string" && o.menu_name.trim() !== ""
            ? o.menu_name
            : typeof o.set_name === "string" && o.set_name.trim() !== ""
            ? o.set_name
            : "(이름 없음)";

        // ✅ 이미지: menu_image → set_image 순서로 사용 + "null"/빈문자 처리
        const rawImg =
          (typeof o.menu_image === "string" ? o.menu_image : null) ??
          (typeof o.set_image === "string" ? o.set_image : null);

        const menu_image =
          typeof rawImg === "string" &&
          rawImg.trim() !== "" &&
          rawImg.trim().toLowerCase() !== "null"
            ? rawImg
            : null;

        // ✅ 단가: price → menu_price → set_price → fixed_price
        const price =
          typeof o.fixed_price === "number"
            ? o.fixed_price
            : typeof o.price === "number"
            ? o.price
            : typeof o.menu_price === "number"
            ? o.menu_price
            : typeof o.set_price === "number"
            ? o.set_price
            : 0;

        // ✅ 수량: quantity → menu_num
        const quantity =
          typeof o.quantity === "number"
            ? o.quantity
            : typeof o.menu_num === "number"
            ? o.menu_num
            : 1;

        return {
          menu_image,
          menu_name: name,
          price,
          quantity,
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
