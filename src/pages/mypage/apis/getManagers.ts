// mypage/api/getManager.ts
import axios, { AxiosError } from "axios";

/** 좌석 과금 타입 */
export type SeatType = "PT" | "PP" | "NO"; // Per Table / Per Person / No Seat Tax

/** 운영자 정보 스키마 (data) */
export interface ManagerInfo {
    user: number;
    booth: number; // booth_id
    booth_name: string;
    table_num: number;
    order_check_password: string;
    account: string;
    depositor: string;
    bank: string;
    seat_type: SeatType;
    seat_tax_person: number | null;
    seat_tax_table: number | null;
    table_limit_hours: number; // 분 단위(예: 120)
}

/** 공통 응답 래퍼 */
export interface ApiEnvelope<T> {
    message: string;
    code: number; // HTTP status code
    data: T | null;
}

/** 오류 응답 형태(명세 예시 기반) */
export interface ApiErrorBody {
    status?: "error";
    message?: string;
    code?: number;
    data?: unknown;
}

const BASE_URL = import.meta.env.VITE_BASE_URL ?? "";

const api = axios.create({
    baseURL: BASE_URL,
    withCredentials: false,
    headers: {
        "Content-Type": "application/json",
    },
});

/** 로컬에서 액세스 토큰 가져오기 (우선순위: accessToken > access > token) */
function getLocalToken(): string | null {
    return (
        localStorage.getItem("accessToken") ||
        localStorage.getItem("access") ||
        localStorage.getItem("token")
    );
}

/** 요청 시 Authorization 헤더 구성 */
function authHeaders(token?: string) {
    const t = token ?? getLocalToken();
    return t ? { Authorization: `Bearer ${t}` } : {};
}

/** 에러를 사람이 읽기 쉬운 형태로 변환하여 throw */
function normalizeAndThrow(error: unknown): never {
    if (axios.isAxiosError(error)) {
        const err = error as AxiosError<ApiErrorBody>;
        const body = err.response?.data;
        const status = err.response?.status;

        const msg =
        body?.message ||
        (status === 401
            ? "로그인 후 이용해주세요!"
            : status === 400
            ? "입력한 값이 유효하지 않습니다."
            : status === 403
            ? "접근 권한이 없습니다."
            : "요청 처리 중 오류가 발생했습니다.");

        const enriched = {
        message: msg,
        code: body?.code ?? status ?? 500,
        data: body?.data ?? null,
        };
        throw enriched;
    }

    // axios 외의 오류
    throw {
        message: "알 수 없는 오류가 발생했습니다.",
        code: 500,
        data: null,
    };
}

/** 1) 운영자 정보 조회 (GET /api/v2/manager/mypage/) */
export async function getManagerInfo(params?: {
    token?: string;
    }): Promise<ApiEnvelope<ManagerInfo>> {
    try {
        const res = await api.get<ApiEnvelope<ManagerInfo>>(
        "/api/v2/manager/mypage/",
        { headers: authHeaders(params?.token) }
        );
        return res.data;
    } catch (e) {
        normalizeAndThrow(e);
    }
}

/** 2) 운영자 정보 수정 (PATCH /api/v2/manager/mypage/) */
export async function patchManagerInfo(
    payload: Partial<ManagerInfo>,
    params?: { token?: string }
    ): Promise<ApiEnvelope<ManagerInfo>> {
    try {
        const res = await api.patch<ApiEnvelope<ManagerInfo>>(
        "/api/v2/manager/mypage/",
        payload,
        { headers: authHeaders(params?.token) }
        );
        return res.data;
    } catch (e) {
        normalizeAndThrow(e);
    }
}

/** 좌석 과금 타입에 따른 필드 정합성 보조(선택): PP/NO/PT에 맞춰 null 처리 */
export function normalizeSeatFields(
    patch: Partial<ManagerInfo>
    ): Partial<ManagerInfo> {
    const seat = patch.seat_type;
    if (!seat) return patch;

    const next: Partial<ManagerInfo> = { ...patch };
    if (seat === "PP") {
        // 인당 과금: table은 null이어야 자연스럽다
        if (typeof next.seat_tax_table !== "undefined") next.seat_tax_table = null;
        if (typeof next.seat_tax_person === "undefined") next.seat_tax_person = 0;
    } else if (seat === "PT") {
        // 테이블당 과금: person은 null
        if (typeof next.seat_tax_person !== "undefined")
        next.seat_tax_person = null;
        if (typeof next.seat_tax_table === "undefined") next.seat_tax_table = 0;
    } else if (seat === "NO") {
        // 과금 없음: 둘 다 null
        next.seat_tax_person = null;
        next.seat_tax_table = null;
    }
    return next;
}
