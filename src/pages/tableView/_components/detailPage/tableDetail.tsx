// tableView/_components/detailPage/tableDetail.tsx
import * as S from "./tableDetail.styled";
import ACCO from "@assets/images/character.svg";
import { IMAGE_CONSTANTS } from "@constants/imageConstants";
import CancelMenuModal from "../../_modal/CancelMenuModal";
import CancelConfirmModal from "../../_modal/CancelConfirmModal";
import ResetModal from "../../_modal/ResetModal";
import EmptyOrder from "./emptyOrder";

import {
  getTableDetail,
  type TableDetailData as APITableDetail, // ✅ 실제 타입(정규화된 데이터)
} from "../../_apis/getTableDetail";
import { resetTable as resetTableAPI } from "../../_apis/resetTable";
import {
  updateOrderQuantity, // ✅ (orderId, items[])
  type CancelItem,
} from "../../_apis/updateOrderQuantity";

import { useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

interface Props {
    data: APITableDetail; // ✅ 실제 타입 반영
    onBack?: () => void;
}

/** 기존 화면 컴포넌트가 쓰던 형태(레거시)로 매핑 */
type LegacyOrder = {
    id?: number;               // 화면 내부 키 (= order_item_id/ordermenu_id)
    order_id?: number;         // 주문 PK
    menu_name: string;
    menu_price: number;        // 단가
    menu_num: number;          // 수량
    menu_image: string | null;
    order_status?: string;
    };

    type LegacyDetail = {
    table_num: number;
    table_price: number;       // = table_amount
    table_status: string;
    created_at: string | null;
    orders: LegacyOrder[];
};

/** 정규화된 API 데이터 → 레거시 화면 데이터로 변환 */
const normalizeDetail = (api: APITableDetail): LegacyDetail => ({
    table_num: api.table_num,
    table_price: api.table_amount ?? 0,
    table_status: api.table_status ?? "unknown",
    created_at: api.created_at ?? null,
    orders: (api.orders ?? []).map((o: any) => ({
        // ✅ 항목 PK를 화면 id 로 사용
        id:
        typeof o?.order_item_id === "number" ? o.order_item_id :
        typeof o?.ordermenu_id === "number" ? o.ordermenu_id :
        typeof o?.order_menu_id === "number" ? o.order_menu_id :
        typeof o?.ordersetmenu_id === "number" ? o.ordersetmenu_id :
        typeof o?.order_setmenu_id === "number" ? o.order_setmenu_id :
        undefined,
        order_id: typeof o?.order_id === "number" ? o.order_id : undefined,
        menu_name: o?.menu_name ?? "(이름 없음)",
        menu_price:
        typeof o?.price === "number"
            ? o.price
            : typeof o?.menu_price === "number"
            ? o.menu_price
            : 0,
        menu_num:
        typeof o?.quantity === "number"
            ? o.quantity
            : typeof o?.menu_num === "number"
            ? o.menu_num
            : 1,
        menu_image: o?.menu_image ?? null,
        order_status: o?.order_status,
    })),
});

const TableDetail: React.FC<Props> = ({ data, onBack }) => {
    const initial = useMemo(() => normalizeDetail(data), [data]);
    const navigate = useNavigate();

    const [selectedMenu, setSelectedMenu] = useState<{ name: string; quantity: number } | null>(null);
    const [confirmInfo, setConfirmInfo] = useState<{ name: string; quantity: number } | null>(null);
    const [showResetModal, setShowResetModal] = useState(false);
    const [tableDetailData, setTableDetailData] = useState<LegacyDetail>(initial);

    const refetchTableDetail = useCallback(async () => {
        try {
        const response = await getTableDetail(tableDetailData.table_num);
        setTableDetailData(normalizeDetail(response.data));
        } catch {
        // noop
        }
    }, [tableDetailData.table_num]);

    return (
        <>
        <S.DetailWrapper>
            <S.DetailHeader>
            <S.TextWrapper>
                <S.BackButton onClick={() => (onBack ? onBack() : navigate("/table-view"))}>
                <img
                    src={IMAGE_CONSTANTS.BACKWARD_BLACK}
                    alt="뒤로가기버튼"
                />
                </S.BackButton>
                <p className="tableNumber">테이블 {tableDetailData.table_num} |</p>
                <p>상세 주문 내역</p>
            </S.TextWrapper>

            <S.TableReset onClick={() => setShowResetModal(true)}>
                <img src={IMAGE_CONSTANTS.RELOADWHITE} alt="초기화 버튼" />
                테이블 초기화
            </S.TableReset>
            </S.DetailHeader>

            <S.DivideLine />

            <S.TotalPrice>
            <p>💸총 주문금액</p>
            <p className="total">{tableDetailData.table_price.toLocaleString()}원</p>
            </S.TotalPrice>

            <S.MenuList>
            {tableDetailData.orders.length === 0 ? (
                <EmptyOrder />
            ) : (
                tableDetailData.orders.map((order, idx) => (
                <div key={order.id ?? `${order.order_id ?? "noorder"}-${idx}`}>
                    <S.ItemWrapper>
                    <S.ContentContainer>
                        <S.ImageWrapper>
                        <img
                            src={order.menu_image || ACCO}
                            alt={order.menu_name}
                            onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = ACCO;
                            }}
                        />
                        </S.ImageWrapper>
                        <S.TitleWrapper>
                        <p className="menuName">{order.menu_name}</p>
                        <S.GrayText>
                            <p>수량 : {order.menu_num}</p>
                            <p>가격 : {order.menu_price.toLocaleString()}원</p>
                        </S.GrayText>
                        </S.TitleWrapper>
                    </S.ContentContainer>
                    <S.ButtonWrapper>
                        <S.CancleButton
                        onClick={() =>
                            setSelectedMenu({ name: order.menu_name, quantity: order.menu_num })
                        }
                        >
                        <img src={IMAGE_CONSTANTS.Delete} alt="삭제" />
                        주문 취소
                        </S.CancleButton>
                    </S.ButtonWrapper>
                    </S.ItemWrapper>
                    <S.DivideLine />
                </div>
                ))
            )}
            </S.MenuList>
        </S.DetailWrapper>

        {/* 수량 선택 모달 */}
        {selectedMenu && (
            <CancelMenuModal
            menuName={selectedMenu.name}
            initialQuantity={selectedMenu.quantity}
            onClose={() => setSelectedMenu(null)}
            onConfirmRequest={(q) => {
                setSelectedMenu(null);
                setConfirmInfo({ name: selectedMenu.name, quantity: q });
            }}
            />
        )}

        {/* 확인 모달 */}
        {confirmInfo && (
            <CancelConfirmModal
            onConfirm={async () => {
                try {
                // 같은 이름의 메뉴가 여러 개 있을 가능성 → 첫 번째 매칭
                const order = tableDetailData.orders.find(
                    (o) => o.menu_name === confirmInfo.name
                );

                if (!order) {
                    alert("해당 주문을 찾을 수 없습니다.");
                    setConfirmInfo(null);
                    return;
                }

                // ✅ URL의 {order_id}는 상세 응답의 각 항목에 포함된 order_id 사용
                if (!order.order_id) {
                    alert("주문 ID가 없어 취소 요청을 보낼 수 없습니다. (order_id 미제공)");
                    setConfirmInfo(null);
                    return;
                }

                // ✅ 바디의 order_item_id(= ordermenu_id 등) 필요
                if (!order.id) {
                    alert("주문 항목 ID가 없어 취소 요청을 보낼 수 없습니다. (order_item_id 미제공)");
                    setConfirmInfo(null);
                    return;
                }

                const payloadItem: CancelItem = {
                    order_item_id: order.id,
                    quantity: confirmInfo.quantity,
                };

                await updateOrderQuantity(
                    order.order_id,        // ✅ 실제 주문 PK
                    [payloadItem]
                );

                setConfirmInfo(null);
                await refetchTableDetail();
                } catch {
                setConfirmInfo(null);
                }
            }}
            onCancel={() => setConfirmInfo(null)}
            />
        )}

        {/* 초기화 모달 */}
        {showResetModal && (
            <ResetModal
                resetTable={async () => {
                    try {
                    await resetTableAPI(tableDetailData.table_num);
                    setShowResetModal(false);
                    await refetchTableDetail();
                    } catch {
                    setShowResetModal(false);
                    }
                }}
                onCancel={() => setShowResetModal(false)}
            />
        )}
        </>
    );
};

export default TableDetail;
