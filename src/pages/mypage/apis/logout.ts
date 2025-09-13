// mypage/apis/logout.ts
import axios, { AxiosError } from "axios";

export interface ApiEnvelope<T> {
    message: string;
    code: number;
    data: T | null;
}

const BASE_URL = import.meta.env.VITE_BASE_URL ?? "";

const api = axios.create({
    baseURL: BASE_URL,
    // 쿠키 기반 세션/토큰 삭제를 서버가 처리하는 경우가 많아, withCredentials를 켭니다.
    withCredentials: true,
    headers: { "Content-Type": "application/json" },
});

function normalizeAndThrow(error: unknown): never {
    if (axios.isAxiosError(error)) {
        const err = error as AxiosError<any>;
        const status = err.response?.status ?? 500;
        const body = err.response?.data as Partial<ApiEnvelope<null>> | undefined;
        throw {
        message:
            body?.message ||
            (status === 400
            ? "이미 로그아웃된 상태입니다."
            : "로그아웃에 실패 했습니다."),
        code: body?.code ?? status,
        data: null,
        } as ApiEnvelope<null>;
    }
    throw { message: "로그아웃에 실패 했습니다.", code: 500, data: null } as ApiEnvelope<null>;
}

/** 로그아웃: DELETE /api/v2/manager/auth/ */
export async function requestLogout(): Promise<ApiEnvelope<null>> {
    try {
        const res = await api.delete<ApiEnvelope<null>>("/api/v2/manager/auth/");
        return res.data;
    } catch (e) {
        normalizeAndThrow(e);
    }
}
