// tableView/_apis/getTableList.ts
import { instance } from "@services/instance";
import { mockTableList, delay } from "../../../mocks/mockData";

// 목업 모드 활성화 (항상 목업 모드로 동작)
const USE_MOCK = true;

// ── 서버 원형(명세 + 예시 오타 허용)
type RawLatestOrder = {
  menu_name?: string;
  menu_price?: number;
  menu_num?: number;   // quantity 의미로 올 수 있음
  quantity?: number;   // 혹은 이 키
};

type RawTableItem = {
  table_id?: number;
  table_num?: number;
  table_amount?: number;  // 정식
  table_price?: number;   // 예시 오타 대비
  table_status?: "activate" | "out" | string;
  table_stauts?: "activate" | "out" | string; // 오타
  created_at?: string | null;
  latest_orders?: RawLatestOrder[];
};

type RawResponse = {
  status?: string | number;
  message?: string;
  code?: number;
  data?: RawTableItem[] | null;
};

// ── UI 친화 타입(기존 컴포넌트와의 호환 고려)
export type LatestOrder = {
  name: string;
  qty: number;
  price?: number;
};

export type TableItem = {
  tableNum: number;
  amount: number;
  status: "activate" | "out" | "unknown";
  createdAt: string | null;
  latestOrders: LatestOrder[];
};

export type TableListResponse = {
  status: string;
  message: string;
  code: number;
  data: TableItem[];
};

const normalize = (raw: RawTableItem): TableItem | null => {
  if (raw.table_num == null) return null;

  const amount =
    typeof raw.table_amount === "number"
      ? raw.table_amount
      : typeof raw.table_price === "number"
      ? raw.table_price
      : 0;

  const statusRaw = (raw.table_status ?? raw.table_stauts) as string | undefined;
  const status: TableItem["status"] =
    statusRaw === "activate" || statusRaw === "out" ? statusRaw : "unknown";

  const latestOrders: LatestOrder[] = Array.isArray(raw.latest_orders)
    ? raw.latest_orders.slice(0, 3).map((o) => ({
        name: o.menu_name ?? "(이름 없음)",
        qty:
          typeof o.quantity === "number"
            ? o.quantity
            : typeof o.menu_num === "number"
            ? o.menu_num
            : 1,
        price: typeof o.menu_price === "number" ? o.menu_price : undefined,
      }))
    : [];

  return {
    tableNum: raw.table_num,
    amount,
    status,
    createdAt: raw.created_at ?? null,
    latestOrders,
  };
};

export const getTableList = async (): Promise<TableListResponse> => {
  // ========== 목업 모드 ==========
  if (USE_MOCK) {
    await delay();
    return {
      status: "success",
      message: "테이블 목록 조회 성공",
      code: 200,
      data: mockTableList,
    };
  }
  // ========== 실제 API 호출 (주석 처리) ==========
  // const res = await instance.get<RawResponse>("/api/v2/booth/tables/");
  // const body = res.data;
  // if (!Array.isArray(body?.data)) {
  //   throw new Error(body?.message ?? "데이터가 비어 있습니다.");
  // }
  // const data = body.data
  //   .map(normalize)
  //   .filter((v): v is TableItem => v !== null);
  // return {
  //   status: String(body.status ?? "success"),
  //   message: body.message ?? "테이블 목록 조회 성공",
  //   code: Number(body.code ?? 200),
  //   data,
  // };
  
  const res = await instance.get<RawResponse>("/api/v2/booth/tables/");
  const body = res.data;

  if (!Array.isArray(body?.data)) {
    throw new Error(body?.message ?? "데이터가 비어 있습니다.");
  }

  const data = body.data
    .map(normalize)
    .filter((v): v is TableItem => v !== null);

  return {
    status: String(body.status ?? "success"),
    message: body.message ?? "테이블 목록 조회 성공",
    code: Number(body.code ?? 200),
    data,
  };
};
