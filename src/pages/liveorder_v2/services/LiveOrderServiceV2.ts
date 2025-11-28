import { instance } from "../../../services/instance";
import { OrderStatus } from "../types";
import { delay } from "../../../mocks/mockData";

// 목업 모드 활성화 (항상 목업 모드로 동작)
const USE_MOCK = true;

/**
 * 부스에 등록된 메뉴 이름 목록을 조회하는 API
 * @returns 메뉴 이름 배열
 */
export const getMenuNames = async (): Promise<string[]> => {
  // ========== 목업 모드 ==========
  if (USE_MOCK) {
    await delay();
    return ["불고기 피자", "페퍼로니 피자", "마르게리타 피자", "콜라", "사이다"];
  }
  // ========== 실제 API 호출 (주석 처리) ==========
  // try {
  //   const response = await instance.get<{ data: string[] }>(
  //     "api/v2/booth/menu-names/"
  //   );
  //   return response.data.data;
  // } catch (error) {
  //   console.error("드롭다운 메뉴 이름 조회에 실패했습니다:", error);
  //   return [];
  // }
  
  try {
    const response = await instance.get<{ data: string[] }>(
      "api/v2/booth/menu-names/"
    );
    return response.data.data;
  } catch (error) {
    console.error("드롭다운 메뉴 이름 조회에 실패했습니다:", error);
    return [];
  }
};

/**
 * 주문 상태를 'pending'에서 'cooked'로 변경하는 API 호출
 * @param ordermenuId 상태를 변경할 주문 메뉴 ID
 */
export const updateOrderToCooked = async (
  ordermenuId: number
): Promise<void> => {
  // ========== 목업 모드 ==========
  if (USE_MOCK) {
    await delay();
    console.log(`[MOCK] 주문 ${ordermenuId}를 cooked로 변경`);
    return;
  }
  // ========== 실제 API 호출 (주석 처리) ==========
  // const body = { type: "menu", id: ordermenuId };
  // await instance.post("api/v2/booth/kitchen/orders/", body);
  
  const body = { type: "menu", id: ordermenuId };
  await instance.post("api/v2/booth/kitchen/orders/", body);
};

/**
 * 주문 상태를 'cooked'에서 'served'로 변경하는 API 호출
 * @param ordermenuId 상태를 변경할 주문 메뉴 ID
 */
export const updateOrderToServed = async (
  ordermenuId: number
): Promise<void> => {
  // ========== 목업 모드 ==========
  if (USE_MOCK) {
    await delay();
    console.log(`[MOCK] 주문 ${ordermenuId}를 served로 변경`);
    return;
  }
  // ========== 실제 API 호출 (주석 처리) ==========
  // const body = { type: "menu", id: ordermenuId };
  // await instance.post("api/v2/booth/serving/orders/", body);
  
  const body = { type: "menu", id: ordermenuId };
  await instance.post("api/v2/booth/serving/orders/", body);
};

/**
 * 주문 상태를 되돌리는 API 호출
 * @param ordermenuId 상태를 변경할 주문 메뉴 ID
 * @param targetStatus 변경하려는 목표 상태 (cooked 또는 pending)
 */
export const revertOrderStatus = async (
  ordermenuId: number,
  targetStatus: OrderStatus
): Promise<void> => {
  // ========== 목업 모드 ==========
  if (USE_MOCK) {
    await delay();
    console.log(`[MOCK] 주문 ${ordermenuId}를 ${targetStatus}로 되돌림`);
    return;
  }
  // ========== 실제 API 호출 (주석 처리) ==========
  // const body = { id: ordermenuId, target_status: targetStatus };
  // await instance.patch("api/v2/booth/revert/orders/", body);
  
  const body = { id: ordermenuId, target_status: targetStatus };
  await instance.patch("api/v2/booth/revert/orders/", body);
};
