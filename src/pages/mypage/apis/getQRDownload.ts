// mypage/apis/getQRDownload.ts
import axios, { AxiosError } from "axios";

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

function parseFilenameFromHeader(disposition?: string | null): string | null {
    if (!disposition) return null;
    const m = /filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i.exec(disposition);
    try {
        return decodeURIComponent(m?.[1] || m?.[2] || "");
    } catch {
        return m?.[1] || m?.[2] || null;
    }
}

function inferExtFromContentType(ct?: string | null): string {
    if (!ct) return ".bin";
    if (ct.includes("png")) return ".png";
    if (ct.includes("jpeg") || ct.includes("jpg")) return ".jpg";
    if (ct.includes("webp")) return ".webp";
    if (ct.includes("pdf")) return ".pdf";
    if (ct.includes("zip")) return ".zip";
    return ".bin";
}

function normalizeAndThrow(error: unknown, ctx?: any): never {
    if (axios.isAxiosError(error)) {
        const err = error as AxiosError<{ message?: string }>;
        const status = err.response?.status ?? 0;
        const body = err.response?.data;
        const params = (err.config as any)?.params;
        const serverMsg = body?.message;
        // 에러 메세지 출력
        if (serverMsg) {
        console.error(`[QR][${status}] ${serverMsg}`);
        } else {
        console.error(`[QR][${status}] 요청 실패`);
        }

        // 부가 디버깅 정보(원하면 주석 해제)
        console.error("[QR][DEBUG]", { status, params, body, ctx });

        // 같은 메시지로 throw (없으면 상태코드에 맞는 기본 메시지)
        const fallback =
        status === 404
            ? "QR 코드가 아직 생성되지 않았습니다."
            : status === 400
            ? "요청이 올바르지 않습니다. (필수 파라미터/값 확인)"
            : status === 401
            ? "로그인이 필요합니다."
            : status === 403
            ? "접근 권한이 없습니다."
            : "QR 코드 다운로드에 실패했습니다.";
        throw new Error(serverMsg || fallback);
    }
    console.error("[QR] 알 수 없는 오류", error);
    throw new Error("QR 코드 다운로드에 실패했습니다.");
}

/** 내부: 실제 호출 (manager_id 고정) */
async function fetchQRByManagerId(managerId: number, token?: string) {
    // 시작 로그(선택)
    console.info("[QR] 요청 시작 (manager_id):", managerId);

    const res = await api.get(`/api/v2/manager/qr-download/`, {
        params: { manager_id: managerId },
        headers: { ...authHeaders(token) },
        responseType: "blob",
    });

    const contentType =
        (res.headers["content-type"] as string) || "application/octet-stream";
    const blob = new Blob([res.data], { type: contentType });
    const filenameFromHeader = parseFilenameFromHeader(
        res.headers["content-disposition"] as string | undefined
    );
    return { blob, contentType, filenameFromHeader };
}

/** ✅ QR 코드 다운로드 (manager_id 사용) */
export async function downloadManagerQR(
    managerId: number,
    options?: { token?: string; filename?: string }
    ): Promise<void> {
    try {
        const { blob, contentType, filenameFromHeader } = await fetchQRByManagerId(
        managerId,
        options?.token
        );

        const filename =
        options?.filename ||
        filenameFromHeader ||
        `qr-manager-${managerId}${inferExtFromContentType(contentType)}`;

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);

        console.info("[QR] 다운로드 완료:", filename);
    } catch (e) {
        normalizeAndThrow(e, { tried: "manager_id", id: managerId });
    }
}

/** Blob만 필요할 때 */
export async function fetchManagerQRBlob(
    managerId: number,
    options?: { token?: string }
    ): Promise<Blob> {
    try {
        const { blob } = await fetchQRByManagerId(managerId, options?.token);
        return blob;
    } catch (e) {
        normalizeAndThrow(e, { tried: "manager_id", id: managerId });
    }
}
