import { AxiosResponse } from "axios";
import { instance } from "../../../services/instance";
import { Menu } from "../Type/Menu_type";

export interface MenuResponse {
  status: string;
  message: string;
  code: number;
  data: Menu[];
}

class MenuService {
  // 메뉴 리스트 조회
  static async getMenuList(): Promise<Menu[]> {
    try {
      const response: AxiosResponse<MenuResponse> = await instance.get(
        "/api/manager/menu/"
      );
      return response.data.data;
    } catch (error) {
      throw error;
    }
  }

  // 메뉴 생성
  static async createMenu(menuData: Omit<Menu, "id">): Promise<Menu> {
    try {
      const response: AxiosResponse<{ data: Menu }> = await instance.post(
        "/api/manager/menu/",
        menuData
      );
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
        `/api/manager/menu/${id}/`,
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
      await instance.delete(`/api/manager/menu/${id}/`);
    } catch (error) {
      throw error;
    }
  }
}

export default MenuService;
