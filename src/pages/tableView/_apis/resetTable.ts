// tableView/_apis/resetTable.ts
import { instance } from "@services/instance";

/** 응답 타입 */
export type ResetTableResponse = {
  status: "success" | "fail" | "error" | string;
  message: string;
  code: number;
  data: {
    table_num: number;
    table_status: "out" | "activate" | string;
  } | null;
};

/**
 * POST /api/v2/booth/tables/{table_num}/reset/
 * 바디는 비어 있음
 */
export const resetTable = async (tableNum: number): Promise<ResetTableResponse> => {
  try {
    const res = await instance.post<ResetTableResponse>(
      `/api/v2/booth/tables/${tableNum}/reset/`,
      {}
    );
    return res.data;
  } catch (e: any) {
    const msg =
      e?.response?.data?.message ||
      e?.message ||
      "테이블 리셋에 실패했습니다.";
    throw new Error(msg);
  }
};
