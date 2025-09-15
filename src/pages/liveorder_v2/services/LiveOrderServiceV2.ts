import { instance } from "../../../services/instance";

/**
 * 부스에 등록된 메뉴 이름 목록을 조회하는 API
 * @returns 메뉴 이름 배열
 */
export const getMenuNames = async (): Promise<string[]> => {
  try {
    // API 명세에 따라 GET 요청으로 수정
    const response = await instance.get<{ data: string[] }>(
      "/api/v2/booth/menu-names/"
    );
    return response.data.data;
  } catch (error) {
    console.error("드롭다운 메뉴 이름 조회에 실패했습니다:", error);
    return []; // 에러 발생 시 빈 배열 반환
  }
};
