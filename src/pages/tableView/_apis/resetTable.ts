// tableView/_apis/resetTable.ts
import { instance } from "@services/instance";
import { delay } from "../../../mocks/mockData";

// 목업 모드 활성화 (항상 목업 모드로 동작)
const USE_MOCK = true;

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
  // ========== 목업 모드 ==========
  if (USE_MOCK) {
    await delay();
    return {
      status: "success",
      message: "테이블이 리셋되었습니다.",
      code: 200,
      data: {
        table_num: tableNum,
        table_status: "out",
      },
    };
  }
  // ========== 실제 API 호출 (주석 처리) ==========
  // try {
  //   const res = await instance.post<ResetTableResponse>(
  //     `/api/v2/booth/tables/${tableNum}/reset/`,
  //     {}
  //   );
  //   return res.data;
  // } catch (e: any) {
  //   const msg =
  //     e?.response?.data?.message ||
  //     e?.message ||
  //     "테이블 리셋에 실패했습니다.";
  //   throw new Error(msg);
  // }
  
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
