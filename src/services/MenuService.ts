import { AxiosResponse } from "axios";
import { instance } from "./instance";
import { BoothMenuData, Menu } from "../pages/menu/Type/Menu_type";
import { MenuRegistResponse } from "./MenuServiceWithImg";
import { mockBoothMenuData, mockMenus, delay } from "../mocks/mockData";

// 목업 모드 활성화 (항상 목업 모드로 동작)
const USE_MOCK = true;

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
    // ========== 목업 모드 ==========
    if (USE_MOCK) {
      await delay();
      return mockBoothMenuData;
    }
    // ========== 실제 API 호출 (주석 처리) ==========
    // try {
    //   const response: AxiosResponse<GetMenuListResponse> = await instance.get(
    //     "/api/v2/booth/all-menus/"
    //   );
    //   return response.data.data;
    // } catch (error) {
    //   throw error;
    // }
    
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
    // ========== 목업 모드 ==========
    if (USE_MOCK) {
      await delay();
      const newMenu: Menu = {
        ...mockMenus[0],
        menu_id: mockMenus.length + 1,
        menu_name: formData.get('menu_name') as string || '새 메뉴',
      };
      return newMenu;
    }
    // ========== 실제 API 호출 (주석 처리) ==========
    // try {
    //   const response: AxiosResponse<CreateMenuResponse> = await instance.post(
    //     "/api/v2/booth/menus/",
    //     formData
    //   );
    //   return response.data.data;
    // } catch (error) {
    //   throw error;
    // }
    
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
    // ========== 목업 모드 ==========
    if (USE_MOCK) {
      await delay();
      const menu = mockMenus.find(m => m.menu_id === id) || mockMenus[0];
      return { ...menu, menu_name: formData.get('menu_name') as string || menu.menu_name };
    }
    // ========== 실제 API 호출 (주석 처리) ==========
    // try {
    //   const response: AxiosResponse<{ data: Menu }> = await instance.put(
    //     `/api/v2/booth/menus/${id}/`,
    //     formData
    //   );
    //   return response.data.data;
    // } catch (error) {
    //   throw error;
    // }
    
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
    // ========== 목업 모드 ==========
    if (USE_MOCK) {
      await delay();
      return;
    }
    // ========== 실제 API 호출 (주석 처리) ==========
    // try {
    //   await instance.delete(`/api/v2/booth/menus/${id}/`);
    // } catch (error) {
    //   throw error;
    // }
    
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
    // ========== 목업 모드 ==========
    if (USE_MOCK) {
      await delay();
      return;
    }
    // ========== 실제 API 호출 (주석 처리) ==========
    // try {
    //   await instance.post(`/api/v2/booth/setmenus/`, payload);
    // } catch (error) {
    //   throw error;
    // }
    
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
    // ========== 목업 모드 ==========
    if (USE_MOCK) {
      await delay();
      return {
        status: "success",
        message: "세트 메뉴 수정 성공",
        code: 200,
        data: null,
      };
    }
    // ========== 실제 API 호출 (주석 처리) ==========
    // try {
    //   const response = await instance.patch<MenuRegistResponse>(
    //     `/api/v2/booth/setmenus/${set_menu_id}/`,
    //     formData
    //   );
    //   return response.data;
    // } catch (error) {
    //   return {
    //     status: "error",
    //     message: "세트 메뉴 수정에 실패했습니다.",
    //     code: 500,
    //     data: null,
    //   };
    // }
    
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
    // ========== 목업 모드 ==========
    if (USE_MOCK) {
      await delay();
      return;
    }
    // ========== 실제 API 호출 (주석 처리) ==========
    // try {
    //   await instance.delete(`/api/v2/booth/setmenus/${id}/`);
    // } catch (error) {
    //   throw error;
    // }
    
    try {
      await instance.delete(`/api/v2/booth/setmenus/${id}/`);
    } catch (error) {
      throw error;
    }
  },
};

export default MenuService;
