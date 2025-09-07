export type TableInfo = {
  seat_type: "person" | "table" | "테이블 이용료 없음";
  seat_tax_person: number | string;
};

export interface Menu {
  menu_id: number;
  booth_id: number;
  menu_name: string;
  menu_description: string;
  menu_category: string;
  menu_price: number;
  menu_amount: number;
  menu_image: string;
  is_selling?: boolean;
  is_sold_out?: boolean;
}

export interface SetMenu {
  set_menu_id: number;
  booth_id: number;
  set_category: string;
  set_name: string;
  set_description: string;
  set_image: string;
  set_price: number;
  origin_price: number;
  is_sold_out?: boolean;
  menu_items: { menu_id: number; quantity: number }[];
}
export type BoothMenuData = {
  booth_id: number;
  table?: TableInfo; // 없을 수도 있음
  menus: Menu[];
  setmenus: SetMenu[];
};
