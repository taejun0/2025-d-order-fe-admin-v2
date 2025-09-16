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

const NULL_RULE_HINT = "seat_type이 'no seat tax'일 경우";

function includesNullRuleHint(err: unknown) {
  if (!axios.isAxiosError(err)) return false;
  const data = err.response?.data;
  // 서버가 배열/문자열로 줄 수 있어 양쪽 케이스 케어
  const msgs: string[] = Array.isArray(data?.message)
    ? data.message
    : data?.message
    ? [String(data.message)]
    : [];
  return msgs.some((m) => m.includes(NULL_RULE_HINT));
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
    next.seat_tax_table = null;
  } else if (patch.seat_type === "PT") {
    next.seat_tax_person = null;
  } else if (patch.seat_type === "NO") {
    next.seat_tax_person = null;
    next.seat_tax_table = null;
  }
  return next;
}

/** PATCH /api/v2/manager/mypage/ */
export async function patchManagerInfo(
  payload: Partial<ManagerInfo>,
  options?: { token?: string }
): Promise<ApiEnvelope<ManagerInfo>> {
  // 1) NULL 규칙 보정
  const body: any = normalizeSeatFields(payload);

  // 2) 숫자만 캐스팅 (null은 건드리지 않음)
  if (body.seat_tax_person != null) body.seat_tax_person = Number(body.seat_tax_person);
  if (body.seat_tax_table != null) body.seat_tax_table = Number(body.seat_tax_table);
  if (body.table_limit_hours != null) body.table_limit_hours = Number(body.table_limit_hours);

  try {
    const res = await api.patch<ApiEnvelope<ManagerInfo>>("/api/v2/manager/mypage/", body, {
      headers: authHeaders(options?.token),
    });
    return res.data;
  } catch (e) {
    // ❗서버가 seat_type 코드명을 'no seat tax'로만 받는 경우 대응
    const shouldRetryNoSeatTax =
      includesNullRuleHint(e) &&
      body?.seat_type === "NO" &&
      body?.seat_tax_person === null &&
      body?.seat_tax_table === null;

    if (shouldRetryNoSeatTax) {
      // 1차 재시도: 'no seat tax'
      try {
        const retry1 = { ...body, seat_type: "no seat tax" };
        const res2 = await api.patch<ApiEnvelope<ManagerInfo>>("/api/v2/manager/mypage/", retry1, {
          headers: authHeaders(options?.token),
        });
        return res2.data;
      } catch (e2) {
        // 2차 재시도: 'NO_SEAT_TAX' (혹시 enum이 스네이크 케이스일 수도 있으니)
        try {
          const retry2 = { ...body, seat_type: "NO_SEAT_TAX" };
          const res3 = await api.patch<ApiEnvelope<ManagerInfo>>("/api/v2/manager/mypage/", retry2, {
            headers: authHeaders(options?.token),
          });
          return res3.data;
        } catch (e3) {
          // 그래도 실패 시 원래 에러 포맷으로 던지기
          return normalizeAndThrow(e3);
        }
      }
    }

    return normalizeAndThrow(e);
  }
}
