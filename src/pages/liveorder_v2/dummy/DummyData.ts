// src/pages/liveOrder_v2/_mocks/dummyData.ts

import { OrderItem } from "../types";
import pizza from "@assets/images/Pizza.svg";

export const DUMMY_LIVE_ORDERS: OrderItem[] = [
  {
    id: 101,
    menu_name: "매콤 로제 파스타",
    menu_num: 1,
    table_num: 2,
    status: "PREPARING",
    created_at: "2025-09-04T15:30:00+09:00",
    menu_image: `${pizza}`,
  },
  {
    id: 102,
    menu_name: "트러플 풍기 피자",
    menu_num: 1,
    table_num: 5,
    status: "PREPARING",
    created_at: "2025-09-04T15:32:00+09:00",
    menu_image: `${pizza}`,
  },
  {
    id: 103,
    menu_name: "자몽 에이드",
    menu_num: 2,
    table_num: 2,
    status: "PREPARING",
    created_at: "2025-09-04T15:33:00+09:00",
    menu_image: `${pizza}`,
  },
  {
    id: 104,
    menu_name: "시그니처 비프 스테이크",
    menu_num: 1,
    table_num: 3,
    status: "PREPARING",
    created_at: "2025-09-04T15:25:00+09:00",
    menu_image: `${pizza}`,
  },
  {
    id: 105,
    menu_name: "클래식 시저 샐러드",
    menu_num: 1,
    table_num: 1,
    status: "PREPARING",
    created_at: "2025-09-04T15:28:00+09:00",
    menu_image: `${pizza}`,
  },
  {
    id: 106,
    menu_name: "매콤 로제 파스타",
    menu_num: 2,
    table_num: 3,
    status: "PREPARING",
    created_at: "2025-09-04T15:29:00+09:00",
    menu_image: `${pizza}`,
  },
  {
    id: 107,
    menu_name: "레몬 에이드",
    menu_num: 1,
    table_num: 4,
    status: "PREPARING",
    created_at: "2025-09-04T15:11:00+09:00",
    menu_image: null,
  },
];

// 메뉴 리스트
export interface MenuItem {
  id: number;
  name: string;
}

export const DUMMY_MENU_LIST: MenuItem[] = [
  { id: 1, name: "시그니처 비프 스테이크" },
  { id: 2, name: "매콤 로제 파스타" },
  { id: 3, name: "트러플 풍기 피자" },
  { id: 4, name: "클래식 시저 샐러드" },
  { id: 5, name: "자몽 에이드" },
  { id: 6, name: "레몬 에이드" },
];
