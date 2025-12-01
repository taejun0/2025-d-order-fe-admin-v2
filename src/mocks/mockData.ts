// 목업 데이터
import type { LoginResponse } from '../services/UserService';
import type {
  BoothMenuData,
  Menu,
  SetMenu,
} from '../pages/menu/Type/Menu_type';
import type {
  Coupon,
  CouponDetail,
  CouponCode,
} from '../services/CouponService';
import type { DashboardResponse } from '../pages/dashboard/_services/dashboard.types';
import type { TableItem } from '../pages/tableView/_apis/getTableList';

const baseUrl = import.meta.env.BASE_URL;

// 로그인 목업 데이터
export const mockLoginResponse: LoginResponse = {
  message: '로그인 성공',
  code: 200,
  token: {
    access: 'mock-access-token-12345',
  },
  data: {
    manager_id: 1,
    booth_id: 1,
  },
};

// 회원가입 목업 데이터
export const mockSignupResponse = {
  message: '회원가입 성공',
  code: 200,
  data: {
    manager_id: 1,
    booth_id: 1,
  },
};

// 메뉴 목업 데이터
export const mockMenus: Menu[] = [
  {
    menu_id: 1,
    booth_id: 1,
    menu_name: '불고기 피자',
    menu_description: '달콤한 불고기와 피자의 만남',
    menu_category: '피자',
    menu_price: 25000,
    menu_amount: 50,
    menu_image: `${baseUrl}images/Pizza.png`,
    is_selling: true,
    is_sold_out: false,
  },
  {
    menu_id: 2,
    booth_id: 1,
    menu_name: '페퍼로니 피자',
    menu_description: '매콤한 페퍼로니 피자',
    menu_category: '피자',
    menu_price: 22000,
    menu_amount: 30,
    menu_image: `${baseUrl}images/Pizza.png`,
    is_selling: true,
    is_sold_out: false,
  },
  {
    menu_id: 3,
    booth_id: 1,
    menu_name: '마르게리타 피자',
    menu_description: '클래식한 마르게리타 피자',
    menu_category: '피자',
    menu_price: 20000,
    menu_amount: 20,
    menu_image: `${baseUrl}images/Pizza.png`,
    is_selling: true,
    is_sold_out: false,
  },
  {
    menu_id: 4,
    booth_id: 1,
    menu_name: '콜라',
    menu_description: '시원한 콜라',
    menu_category: '음료',
    menu_price: 2000,
    menu_amount: 100,
    menu_image: `${baseUrl}images/cola.png`,
    is_selling: true,
    is_sold_out: false,
  },
  {
    menu_id: 5,
    booth_id: 1,
    menu_name: '사이다',
    menu_description: '시원한 사이다',
    menu_category: '음료',
    menu_price: 2000,
    menu_amount: 5,
    menu_image: `${baseUrl}images/cola.png`,
    is_selling: true,
    is_sold_out: false,
  },
];

export const mockSetMenus: SetMenu[] = [
  {
    set_menu_id: 1,
    booth_id: 1,
    set_category: '세트',
    set_name: '피자 세트 A',
    set_description: '피자 + 콜라',
    set_image: `${baseUrl}images/Pizza.png`,
    set_price: 26000,
    origin_price: 27000,
    is_sold_out: false,
    menu_items: [
      { menu_id: 1, quantity: 1 },
      { menu_id: 4, quantity: 1 },
    ],
  },
];

export const mockBoothMenuData: BoothMenuData = {
  booth_id: 1,
  table: {
    seat_type: 'table',
    seat_tax_person: 0,
    seat_tax_table: 5000,
  },
  menus: mockMenus,
  setmenus: mockSetMenus,
};

// 쿠폰 목업 데이터
export const mockCoupons: Coupon[] = [
  {
    coupon_id: 1,
    coupon_name: '신규 가입 할인',
    discount_type: 'percent',
    discount_value: 10,
    is_used: false,
    created_at: '2025-01-15T10:00:00Z',
    total_count: 100,
    remaining_count: 85,
  },
  {
    coupon_id: 2,
    coupon_name: '5000원 할인 쿠폰',
    discount_type: 'amount',
    discount_value: 5000,
    is_used: false,
    created_at: '2025-01-14T10:00:00Z',
    total_count: 50,
    remaining_count: 30,
  },
];

export const mockCouponDetail: CouponDetail = {
  coupon_id: 1,
  coupon_name: '신규 가입 할인',
  coupon_description: '신규 고객을 위한 10% 할인 쿠폰',
  discount_type: 'percent',
  discount_value: 10,
  quantity: 100,
  used_count: 15,
  unused_count: 85,
  created_at: '2025-01-15T10:00:00Z',
  total_count: 100,
  remaining_count: 85,
};

export const mockCouponCodes: CouponCode[] = [
  {
    code: 'COUPON-001',
    issued_to_table: '1',
    is_used: false,
    used_at: null,
  },
  {
    code: 'COUPON-002',
    issued_to_table: '2',
    is_used: true,
    used_at: '2025-01-15T12:00:00Z',
  },
  {
    code: 'COUPON-003',
    issued_to_table: null,
    is_used: false,
    used_at: null,
  },
];

// 부스 매출 목업 데이터
export const mockBoothRevenue = {
  status: 'success',
  message: '부스 매출 조회 성공',
  code: 200,
  data: {
    booth_id: 1,
    booth_name: '테스트 부스',
    total_revenue: 1250000,
  },
};

// 대시보드 목업 데이터
export const mockDashboardResponse: DashboardResponse = {
  status: 'success',
  data: {
    total_orders: 150,
    recent_orders: 25,
    visitors: 120,
    recent_visitors: 20,
    seatType: 'table',
    avg_wait_time: 15,
    avg_table_usage: 45,
    turnover_rate: 2.5,
    served_count: 18,
    waiting_count: 7,
    top3_menus: [
      {
        menu_name: '불고기 피자',
        menu_image: `${baseUrl}images/Pizza.png`,
        price: 25000,
        total_quantity: 45,
      },
      {
        menu_name: '페퍼로니 피자',
        menu_image: `${baseUrl}images/Pizza.png`,
        price: 22000,
        total_quantity: 38,
      },
      {
        menu_name: '마르게리타 피자',
        menu_image: `${baseUrl}images/Pizza.png`,
        price: 20000,
        total_quantity: 32,
      },
    ],
    low_stock: [
      {
        menu_name: '사이다',
        menu_image: `${baseUrl}images/cola.png`,
        price: 2000,
        remaining: 5,
      },
      {
        menu_name: '콜라',
        menu_image: `${baseUrl}images/cola.png`,
        price: 2000,
        remaining: 10,
      },
    ],
  },
};

// 테이블 목록 목업 데이터
export const mockTableList: TableItem[] = [
  {
    tableNum: 1,
    amount: 45000,
    status: 'activate',
    createdAt: '2025-01-15T10:00:00Z',
    latestOrders: [
      { name: '불고기 피자', qty: 1, price: 25000 },
      { name: '콜라', qty: 2, price: 2000 },
    ],
  },
  {
    tableNum: 2,
    amount: 22000,
    status: 'activate',
    createdAt: '2025-01-15T11:00:00Z',
    latestOrders: [{ name: '페퍼로니 피자', qty: 1, price: 22000 }],
  },
  {
    tableNum: 3,
    amount: 0,
    status: 'out',
    createdAt: null,
    latestOrders: [],
  },
  {
    tableNum: 4,
    amount: 26000,
    status: 'activate',
    createdAt: '2025-01-15T12:00:00Z',
    latestOrders: [{ name: '피자 세트 A', qty: 1, price: 26000 }],
  },
  {
    tableNum: 5,
    amount: 0,
    status: 'out',
    createdAt: null,
    latestOrders: [],
  },
];

// 마이페이지 목업 데이터
export const mockMyPageData = {
  user: 1,
  booth: 1,
  booth_name: '테스트 부스',
  table_num: 10,
  order_check_password: '1234',
  account: '1234567890',
  depositor: '홍길동',
  bank: '신한은행',
  seat_type: 'PT' as const, // PT: 테이블당, PP: 인원당, NO: 받지 않음
  seat_tax_person: null,
  seat_tax_table: 5000,
  table_limit_hours: 120, // 2시간
};

// 주문 목록 목업 데이터 (LiveOrder용)
export const mockOrderItems = [
  {
    ordermenu_id: 1,
    order_id: 1,
    menu_id: 1,
    menu_name: '불고기 피자',
    menu_image: `${baseUrl}images/Pizza.png`,
    quantity: 2,
    status: 'pending' as const,
    created_at: new Date().toISOString(),
    table_num: 1,
    from_set: false,
    set_id: null,
    set_name: null,
  },
  {
    ordermenu_id: 2,
    order_id: 1,
    menu_id: 4,
    menu_name: '콜라',
    menu_image: `${baseUrl}images/cola.png`,
    quantity: 2,
    status: 'pending' as const,
    created_at: new Date().toISOString(),
    table_num: 1,
    from_set: false,
    set_id: null,
    set_name: null,
  },
  {
    ordermenu_id: 3,
    order_id: 2,
    menu_id: 2,
    menu_name: '페퍼로니 피자',
    menu_image: `${baseUrl}images/Pizza.png`,
    quantity: 1,
    status: 'cooked' as const,
    created_at: new Date(Date.now() - 300000).toISOString(),
    table_num: 2,
    from_set: false,
    set_id: null,
    set_name: null,
  },
];

// 지연 함수 (API 호출 시뮬레이션)
export const delay = (ms: number = 500) =>
  new Promise((resolve) => setTimeout(resolve, ms));
