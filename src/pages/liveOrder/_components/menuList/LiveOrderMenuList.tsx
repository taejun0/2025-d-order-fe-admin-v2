import * as S from "./LiveOrderMenuList.styled";
import { IMAGE_CONSTANTS } from "@constants/imageConstants";
//import { OrderItem } from "../../api/LiveOrderService";
import { OrderItem } from "../../dummy/DummyLiveOrderService";
import { useState } from "react";
import styled from "styled-components";

import MenuListItem from "./MenuListItem";

interface LiveOrderMenuListProps {
  orders: OrderItem[];
  onOrderStatusChange: (orderId: number) => void; // orderId를 받도록 변경
  isLoading?: boolean;
  onRefresh?: () => void;
  lastUpdateTime?: string;
  getFadingStatus: (orderId: number) => boolean; // 추가된 prop: 특정 주문의 페이드 상태
}

// 페이드아웃 애니메이션을 위한 스타일드 컴포넌트
const FadeoutItem = styled.div<{ $isFading: boolean }>`
  opacity: ${({ $isFading }) => ($isFading ? 0 : 1)};
  transform: ${({ $isFading }) =>
    $isFading ? "translateY(10px)" : "translateY(0)"};
  transition: opacity 1.8s ease, transform 1.8s ease;
  width: 100%;
`;

// 버튼 클릭 애니메이션을 위한 스타일드 컴포넌트
const AnimatedButton = styled(S.HeaderReloadButton)<{ $isAnimating: boolean }>`
  transform: ${({ $isAnimating }) =>
    $isAnimating ? "scale(1.1)" : "scale(1)"};
  transition: transform 0.3s ease;

  /* 기존의 active 애니메이션 비활성화 */
  &:active {
    animation: none;
  }
`;

const LiveOrderMenuList = ({
  orders,
  onOrderStatusChange,
  isLoading = false,
  onRefresh,
  getFadingStatus,
}: LiveOrderMenuListProps) => {
  // 버튼 애니메이션 상태
  const [isAnimating, setIsAnimating] = useState(false);
  const [activeMode, setActiveMode] = useState("주방"); // 초기값 설정

  // 주문 상태 변경 처리 함수 (orderId를 직접 전달)
  const handleOrderStatusChangeForMenu = (orderId?: number) => {
    if (orderId !== undefined) {
      onOrderStatusChange(orderId);
    }
  };

  // 수동 새로고침 처리 함수 - 애니메이션 추가
  const handleRefresh = () => {
    if (isAnimating) return; // 이미 애니메이션 중이면 실행 방지

    setIsAnimating(true);

    // 애니메이션 종료 후 실제 새로고침 실행 (300ms 애니메이션 후)
    setTimeout(() => {
      if (onRefresh) {
        onRefresh();
      } else {
        window.location.reload();
      }
      // 애니메이션 상태 초기화
      setIsAnimating(false);
    }, 300);
  };

  const categories = [
    { label: "주문시각", flex: 1 },
    { label: "테이블", flex: 1 },
    { label: "메뉴", flex: 2 },
    { label: "수량", flex: 1 },
    { label: "상태", flex: 1 },
  ];

  return (
    <S.LiveOrderMenuList>
      <S.LiveOrderMenuListHeader>
        <S.HeaderBtnWrapper>
          <S.OrderModeBtn
            $isActive={activeMode === "주방"}
            onClick={() => setActiveMode("주방")}
          >
            주방
          </S.OrderModeBtn>
          |
          <S.OrderModeBtn
            $isActive={activeMode === "서빙"}
            onClick={() => setActiveMode("서빙")}
          >
            서빙
          </S.OrderModeBtn>
        </S.HeaderBtnWrapper>
        <AnimatedButton onClick={handleRefresh} $isAnimating={isAnimating}>
          <img src={IMAGE_CONSTANTS.RELOADWHITE} alt="reloadWhite" />
          최신 주문 확인
        </AnimatedButton>
      </S.LiveOrderMenuListHeader>
      {/* 실시간주문카테고리 */}
      <S.MenuListCategory>
        {categories.map((category, index) => (
          <S.MenuListCategoryText key={index} style={{ flex: category.flex }}>
            {category.label}
          </S.MenuListCategoryText>
        ))}
      </S.MenuListCategory>
      {/* 실시간주문 실제 메뉴 리스트 - 스크롤 가능한 컨테이너로 감싸기 */}
      <S.ScrollableMenuContainer>
        {isLoading && orders.length === 0 ? (
          <S.NonOrderText>주문 데이터를 불러오는 중...</S.NonOrderText>
        ) : orders.length === 0 ? (
          <S.NonOrderText>주문 내역이 없습니다.</S.NonOrderText>
        ) : (
          orders.map((order) => {
            const orderId = order.id ? String(order.id) : "";
            // prop으로 받은 페이드 상태 사용
            const isFading = getFadingStatus(order.id!); // order.id는 항상 존재한다고 가정

            return (
              <FadeoutItem
                key={orderId}
                $isFading={isFading} // 여기에서 $isFading prop 사용
              >
                <MenuListItem
                  time={order.time}
                  table={order.table}
                  menu={order.menu}
                  quantity={order.quantity}
                  isServed={order.isServed}
                  imageUrl={order.imageUrl}
                  onServe={() => handleOrderStatusChangeForMenu(order.id)} // order.id 전달
                />
              </FadeoutItem>
            );
          })
        )}
      </S.ScrollableMenuContainer>
    </S.LiveOrderMenuList>
  );
};

export default LiveOrderMenuList;
