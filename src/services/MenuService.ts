import { AxiosResponse } from "axios";
import { instance } from "./instance";
import { BoothMenuData, Menu } from "../pages/menu/Type/Menu_type";
import { TestInstance } from "../pages/menu/api/TestInstance";

// Define precise response shapes per endpoint
interface GetMenuListResponse {
  data: BoothMenuData;
}

interface CreateMenuResponse {
  data: Menu;
}

class MenuService {
  // 메뉴 리스트 조회
  static async getMenuList(): Promise<BoothMenuData> {
    try {
      const response: AxiosResponse<GetMenuListResponse> =
        await TestInstance.get("/api/v2/booth/all-menus/");
      return response.data.data;
    } catch (error) {
      throw error;
    }
  }

  // 메뉴 생성
  static async createMenu(formData: FormData): Promise<Menu> {
    try {
      const response: AxiosResponse<CreateMenuResponse> =
        await TestInstance.post("/api/v2/booth/menus/", formData);
      return response.data.data;
    } catch (error) {
      throw error;
    }
  }

  // 메뉴 수정
  static async updateMenu(
    id: number,
    menuData: Partial<Omit<Menu, "id">>
  ): Promise<Menu> {
    try {
      const response: AxiosResponse<{ data: Menu }> = await instance.put(
        `/api/v2/booth/menus/${id}/`,
        menuData
      );
      return response.data.data;
    } catch (error) {
      throw error;
    }
  }

  // 메뉴 삭제
  static async deleteMenu(id: number): Promise<void> {
    try {
      await TestInstance.delete(`/api/v2/booth/menus/${id}/`);
    } catch (error) {
      throw error;
    }
  }

  // 세트메뉴생성
  // static async createSetMenu(formData: FormData): Promise<Menu> {}
}

export default MenuService;
