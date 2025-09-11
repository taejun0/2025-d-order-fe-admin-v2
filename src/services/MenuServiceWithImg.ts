import { instatnceWithImg } from "./instance";

export interface MenuRegistResponse {
  status: string;
  message: string;
  code: number;
  data: {
    booth_id: number;
    menu_name: string;
    menu_category: string;
    menu_price: number;
    menu_amount: number;
    menu_remain: number;
    menu_image: string;
  } | null;
}
const MenuServiceWithImg = {
  createMenu: async (formData: FormData): Promise<MenuRegistResponse> => {
    try {
      const response = await instatnceWithImg.post<MenuRegistResponse>(
        "/api/v2/booth/menus/",
        formData
      );

      return response.data;
    } catch (error) {
      return {
        status: "error",
        message: "메뉴 등록에 실패했습니다.",
        code: 500,
        data: null,
      };
    }
  },
  updateMenu: async (
    menu_id: number,
    formData: FormData
  ): Promise<MenuRegistResponse> => {
    try {
      const response = await instatnceWithImg.patch<MenuRegistResponse>(
        `/api/v2/booth/menus/${menu_id}/`,
        formData
      );
      return response.data;
    } catch (error) {
      return {
        status: "error",
        message: "메뉴 수정에 실패했습니다.",
        code: 500,
        data: null,
      };
    }
  },
};

export default MenuServiceWithImg;
