// mypage/apis/getManagerPatch.ts
import axios, { AxiosError } from "axios";

export type SeatType = "PT" | "PP" | "NO";

export interface ManagerInfo {
  user: number;
  booth: number;
  booth_name: string;
  table_num: number;
  order_check_password: string | null;
  account: string | null;
  depositor: string | null;
  bank: string | null;
  seat_type: SeatType;
  seat_tax_person: number | null;
  seat_tax_table: number | null;
  table_limit_hours: number; // ex) 120
}

export interface ApiEnvelope<T> {
  message: string;
  code: number;
  data: T | null;
}

const BASE_URL = import.meta.env.VITE_BASE_URL ?? "";

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: false,
  headers: { "Content-Type": "application/json" },
});

function getLocalToken(): string | null {
  return (
    localStorage.getItem("accessToken") ||
    localStorage.getItem("access") ||
    localStorage.getItem("token")
  );
}

function authHeaders(token?: string) {
  const t = token ?? getLocalToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}

function normalizeAndThrow(error: unknown): never {
  if (axios.isAxiosError(error)) {
    const err = error as AxiosError<any>;
    const status = err.response?.status ?? 500;
    const body = err.response?.data as Partial<ApiEnvelope<any>> | undefined;

    const message =
      body?.message ||
      (status === 401
        ? "로그인 후 이용해주세요!"
        : status === 400
        ? "입력한 값이 유효하지 않습니다."
        : status === 403
        ? "필수 입력값이 누락되었습니다."
        : "운영자 정보 수정 중 오류가 발생했습니다.");

    // 서버 원문 메시지 + 상태 콘솔 출력
    console.error("[PATCH manager][ERROR]", { status, body });
    throw { message, code: body?.code ?? status, data: (body as any)?.data ?? null } as ApiEnvelope<null>;
  }
  throw { message: "운영자 정보 수정 중 오류가 발생했습니다.", code: 500, data: null } as ApiEnvelope<null>;
}

/** ✅ 서버 동작에 맞춘 ZERO 모드: 비활성 과금 필드는 0으로 보정 */
export function normalizeSeatFields(patch: Partial<ManagerInfo>) {
  if (!patch.seat_type) return patch;
  const next: Partial<ManagerInfo> = { ...patch };

  if (patch.seat_type === "PP") {
    // 인당 과금: person 값, table은 0
    if (next.seat_tax_person == null) next.seat_tax_person = 0;
    next.seat_tax_table = 0;
  } else if (patch.seat_type === "PT") {
    // 테이블 과금: table 값, person은 0
    if (next.seat_tax_table == null) next.seat_tax_table = 0;
    next.seat_tax_person = 0;
  } else if (patch.seat_type === "NO") {
    // 과금 없음: 둘 다 0
    next.seat_tax_person = 0;
    next.seat_tax_table = 0;
  }
  return next;
}

/** PATCH /api/v2/manager/mypage/ */
export async function patchManagerInfo(
  payload: Partial<ManagerInfo>,
  options?: { token?: string }
): Promise<ApiEnvelope<ManagerInfo>> {
  try {
    // 위에서 zero 모드로 보정
    const body = normalizeSeatFields(payload);

    // 숫자 보장
    if (body.seat_tax_person != null) (body as any).seat_tax_person = Number(body.seat_tax_person);
    if (body.seat_tax_table != null) (body as any).seat_tax_table = Number(body.seat_tax_table);
    if (body.table_limit_hours != null) (body as any).table_limit_hours = Number(body.table_limit_hours);

    const res = await api.patch<ApiEnvelope<ManagerInfo>>("/api/v2/manager/mypage/", body, {
      headers: authHeaders(options?.token),
    });
    return res.data;
  } catch (e) {
    normalizeAndThrow(e);
  }
}
