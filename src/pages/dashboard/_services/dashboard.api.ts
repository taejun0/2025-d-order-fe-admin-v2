// src/pages/Dashboard/_services/dashboard.api.ts
import { instance } from "@services/instance";
import type { DashboardResponse } from "./dashboard.types";
import { mockDashboardResponse, delay } from "../../../mocks/mockData";

// 목업 모드 활성화 (항상 목업 모드로 동작)
const USE_MOCK = true;

const REST_ENDPOINT = "/api/v2/statistic/";

function getBoothIdStrict(): string {
  const v = localStorage.getItem("Booth-ID") ?? localStorage.getItem("boothId");
  if (!v)
    throw new Error("Booth-ID가 없습니다. 로그인/부스 선택을 먼저 완료하세요.");
  const n = Number(v);
  if (!Number.isFinite(n) || n <= 0)
    throw new Error(`Booth-ID가 유효하지 않습니다: ${v}`);
  return String(n);
}

export async function fetchDashboard(): Promise<DashboardResponse> {
  // ========== 목업 모드 ==========
  if (USE_MOCK) {
    await delay();
    return mockDashboardResponse;
  }
  // ========== 실제 API 호출 (주석 처리) ==========
  // const boothId = getBoothIdStrict();
  // const res = await instance.get(REST_ENDPOINT, {
  //   headers: { "Booth-ID": boothId },
  // });
  // return res.data as DashboardResponse;
  
  const boothId = getBoothIdStrict();

  const res = await instance.get(REST_ENDPOINT, {
    headers: { "Booth-ID": boothId },
  });

  return res.data as DashboardResponse;
}
