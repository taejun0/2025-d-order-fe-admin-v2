import { AxiosResponse } from "axios";
import { instance } from "./instance";
import { BoothMenuData, Menu } from "../pages/menu/Type/Menu_type";
import { MenuRegistResponse } from "./MenuServiceWithImg";

// Define precise response shapes per endpoint
interface GetMenuListResponse {
  data: BoothMenuData;
}

interface CreateMenuResponse {
  data: Menu;
}

const MenuService = {
  // 메뉴 리스트 조회
  getMenuList: async (): Promise<BoothMenuData> => {
    try {
      const response: AxiosResponse<GetMenuListResponse> = await instance.get(
        "/api/v2/booth/all-menus/"
      );
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  // 메뉴 생성
  createMenu: async (formData: FormData): Promise<Menu> => {
    try {
      const response: AxiosResponse<CreateMenuResponse> = await instance.post(
        "/api/v2/booth/menus/",
        formData
      );
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  // 메뉴 수정
  updateMenu: async (id: number, formData: FormData): Promise<Menu> => {
    try {
      const response: AxiosResponse<{ data: Menu }> = await instance.put(
        `/api/v2/booth/menus/${id}/`,
        formData
      );
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  // 메뉴 삭제
  deleteMenu: async (id: number) => {
    try {
      await instance.delete(`/api/v2/booth/menus/${id}/`);
    } catch (error) {
      throw error;
    }
  },

  // 세트메뉴생성
  createSettMenu: async (payload: {
    set_name: string;
    set_description: string;
    set_price: number | string;
    menu_items: { menu_id: number; quantity: number }[];
  }): Promise<void> => {
    try {
      await instance.post(`/api/v2/booth/setmenus/`, payload);
    } catch (error) {
      throw error;
    }
  },

  // 세트메뉴 수정
  editSetMenu: async (
    set_menu_id: number,
    formData: FormData
  ): Promise<MenuRegistResponse> => {
    try {
      const response = await instance.patch<MenuRegistResponse>(
        `/api/v2/booth/setmenus/${set_menu_id}/`,
        formData
      );
      return response.data;
    } catch (error) {
      return {
        status: "error",
        message: "세트 메뉴 수정에 실패했습니다.",
        code: 500,
        data: null,
      };
    }
  },

  deleteSetMenu: async (id: number): Promise<void> => {
    try {
      await instance.delete(`/api/v2/booth/setmenus/${id}/`);
    } catch (error) {
      throw error;
    }
  },
};

export default MenuService;
