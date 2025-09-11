// tableView/_components/detailPage/tableDetail.tsx
import * as S from './tableDetail.styled';
import ACCO from '@assets/images/character.svg';
import { IMAGE_CONSTANTS } from '@constants/imageConstants';
import CancelMenuModal from '../../_modal/CancelMenuModal';
import CancelConfirmModal from '../../_modal/CancelConfirmModal';
import ResetModal from '../../_modal/ResetModal';
import EmptyOrder from './emptyOrder';
import { updateOrderQuantity } from '../../_apis/updateOrderQuantity';
import { getTableDetail, type TableDetailData as APITableDetail } from '../../_apis/getTableDetail';
import { resetTable as resetTableAPI } from '../../_apis/resetTable';
import { useMemo, useState, useCallback } from 'react';
import { useNavigate } from "react-router-dom";

interface Props {
  data: APITableDetail; // 새 API 타입
    onBack?: () => void;
}

/** 
 * 🔁 정규화 어댑터:
 *  - 기존 렌더 코드가 기대하던 필드명으로 변환한다.
 *  - id가 없을 수 있으므로 optional로 둔다(취소 기능 시 안내).
 */
type LegacyOrder = {
    id?: number;
    menu_name: string;
    menu_price: number;
    menu_num: number;
    menu_image: string | null;
    order_status?: string; // 명세엔 없지만 기존 구조 보존
};

type LegacyDetail = {
    table_num: number;
    table_price: number; // = table_amount
    table_status: string;
    created_at: string | null;
    orders: LegacyOrder[];
};

const normalizeDetail = (api: APITableDetail): LegacyDetail => {
    

    return {
        table_num: api.table_num,
        table_price: api.table_amount ?? 0,
        table_status: api.table_status ?? 'unknown',
        created_at: api.created_at ?? null,
        orders: (api.orders ?? []).map((o, idx) => ({
        // id는 명세에 없으므로 서버가 주면 쓰고, 없으면 생략
        id: (o as any)?.id, 
        menu_name: o.menu_name ?? '(이름 없음)',
        menu_price:
            typeof o.price === 'number'
            ? o.price
            : typeof (o as any).menu_price === 'number'
            ? (o as any).menu_price
            : 0,
        menu_num:
            typeof o.quantity === 'number'
            ? o.quantity
            : typeof (o as any).menu_num === 'number'
            ? (o as any).menu_num
            : 1,
        menu_image: o.menu_image ?? null,
        order_status: (o as any).order_status, // 있으면 보존
        })),
    };
    };

    const TableDetail: React.FC<Props> = ({ data, onBack }) => {
    // ✅ 진입 시 정규화해서 기존 렌더 코드를 최대한 보존
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
        // noop (UI 변경 없이 유지)
        }
    }, [tableDetailData.table_num]);

    
    return (
        <>
        <S.DetailWrapper>
            <S.DetailHeader>
            <S.TextWrapper>
                <S.BackButton onClick={onBack}>
                <img onClick={() => navigate("/table-view")}  src={IMAGE_CONSTANTS.BACKWARD_BLACK} alt="뒤로가기버튼" />
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
            {/* ✅ table_amount → table_price 로 정규화하여 그대로 렌더 */}
            <p className="total">{tableDetailData.table_price.toLocaleString()}원</p>
            </S.TotalPrice>

            <S.MenuList>
            {tableDetailData.orders.length === 0 ? (
                <EmptyOrder />
            ) : (
                tableDetailData.orders.map((order, idx) => (
                <div key={order.id ?? idx}>
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
                            {/* ✅ quantity/price → menu_num/menu_price 로 정규화해서 표기 */}
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
                const tableNumber = tableDetailData.table_num;
                const order = tableDetailData.orders.find((o) => o.menu_name === confirmInfo.name);
                if (!order) {
                    alert('해당 주문을 찾을 수 없습니다.');
                    setConfirmInfo(null);
                    return;
                }

                // ✅ 새 명세엔 order id 보장이 없으므로, 없으면 안내 후 중단 (UI/흐름은 유지)
                if (!order.id) {
                    alert('이 주문 항목에는 ID가 없어 취소 요청을 보낼 수 없습니다.\n(백엔드에서 order id 제공 필요)');
                    setConfirmInfo(null);
                    return;
                }

                // 기존 로직 유지: n회 감소 호출
                for (let i = 0; i < confirmInfo.quantity; i++) {
                    await updateOrderQuantity(tableNumber, order.id, 'decrease');
                }

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
