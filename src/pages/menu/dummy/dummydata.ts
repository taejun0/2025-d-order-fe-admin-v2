import { BoothMenuData } from "../Type/Menu_type";

export const boothDataDummy: BoothMenuData = {
  booth_id: 1,
  //   table: {
  //     seat_type: "person",
  //     seat_tax_person: 5000,
  //   },
  menus: [
    {
      menu_id: 1,
      booth_id: 1,
      menu_name: "스테이크 플레이트",
      menu_description: "육즙 가득한 스테이크와 샐러드가 함께 제공됩니다.",
      menu_category: "메인",
      menu_price: 12000,
      menu_amount: 100,
      menu_image: "https://image.cdn/steak.jpg",
      is_selling: true,
    },
    {
      menu_id: 2,
      booth_id: 1,
      menu_name: "아이스 아메리카노",
      menu_description: "산미와 고소함이 조화로운 시원한 아메리카노",
      menu_category: "음료",
      menu_price: 3500,
      menu_amount: 123,
      menu_image: "https://image.cdn/americano.jpg",
      is_selling: true,
    },
  ],
  setmenus: [
    {
      set_menu_id: 4,
      booth_id: 1,
      set_category: "세트",
      set_name: "디너 세트",
      set_description: "스테이크, 와인, 전채가 포함된 저녁 세트",
      set_price: 47000,
      set_image: "https://image.cdn/dinner.jpg",
      origin_price: 70000,
      menu_items: [
        {
          menu_id: 1,
          quantity: 1,
        },
        {
          menu_id: 2,
          quantity: 2,
        },
      ],
    },
  ],
};
