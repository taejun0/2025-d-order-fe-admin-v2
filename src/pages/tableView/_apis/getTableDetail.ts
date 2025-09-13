// tableView/_apis/getTableDetail.ts
import { instance } from "@services/instance";

/** ── 서버 원형 타입 (명세 + 예시 오타 허용) ───────────────────────── */
type RawOrder = {
  menu_image?: string | null;
  menu_name?: string;
  price?: number;        // 정식
  menu_price?: number;   // 예시에서 이렇게 올 수도 있음
  quantity?: number;     // 정식
  menu_num?: number;     // 예시에서 이렇게 올 수도 있음
};

type RawTableDetail = {
  table_num?: number;
  table_amount?: number; // 정식
  table_price?: number;  // 혹시 이렇게 올 수도 있음
  table_status?: "activate" | "out" | string;
  created_at?: string | null;
  orders?: RawOrder[];
};

type RawResponse = {
  status?: string | number;
  message?: string;
  code?: number;
  data?: RawTableDetail | null;
};

/** ── 정규화된 UI 타입 ─────────────────────────────────────────────── */
export type OrderDetail = {
  menu_image: string | null;
  menu_name: string;
  price: number;     // 단가
  quantity: number;  // 수량
};

export type TableDetailData = {
  table_num: number;
  table_amount: number; // 누적 합계 (amount/price 혼재 정규화)
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

  const statusRaw = raw.table_status;
  const table_status: TableDetailData["table_status"] =
    statusRaw === "activate" || statusRaw === "out" ? statusRaw : "unknown";

  const orders: OrderDetail[] = Array.isArray(raw.orders)
    ? raw.orders.map((o) => ({
        menu_image: o.menu_image ?? null,
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
      }))
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
export const getTableDetail = async (
  tableNum: number
): Promise<TableDetailResponse> => {
  try {
    const res = await instance.get<RawResponse>(
      `/api/v2/booth/tables/${tableNum}/`
    );
    const body = res.data;

    if (!body?.data) {
      throw new Error(body?.message ?? "데이터가 비어 있습니다.");
    }

    const data = normalize(body.data);

    return {
      status: String(body.status ?? "success"),
      message: body.message ?? "테이블 상세 조회 성공",
      code: Number(body.code ?? 200),
      data,
    };
  } catch (e: any) {
    // 서버가 던진 메시지를 최대한 살려서 throw
    const msg =
      e?.response?.data?.message ||
      e?.message ||
      "테이블 상세 조회 실패";
    throw new Error(msg);
  }
};
