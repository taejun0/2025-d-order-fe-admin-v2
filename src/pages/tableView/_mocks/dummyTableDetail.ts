import { TableDetailData } from "../_apis/getTableDetail";

export const dummyTableDetail: TableDetailData = {
    table_num: 1,
    table_price: 23000,
    table_status: "occupied",
    created_at: "2025-08-02T12:00:00",
    orders: [
        {
            id: 11,
            menu_name: "제육볶음",
            menu_price: 8000,
            menu_num: 2,
            menu_image: "/images/jeuk.png",
            order_status: "cooked",
        },
    ],
};
