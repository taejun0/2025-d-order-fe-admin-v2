// src/pages/liveorder_v2/_components/OrderStateBtn.tsx

import styled from "styled-components";
import { IMAGE_CONSTANTS } from "@constants/imageConstants";
import { useLiveOrderStore, OrderViewMode } from "../LiveOrderStore";
import { OrderStatus } from "../types";
import { useState } from "react";
// 1. 상태별 설정 객체 도입 (로직과 UI 분리)
const STATUS_CONFIG = {
  pending: {
    text: "준비중", // 사용자에게 보여줄 한글 텍스트
    icon: null,
  },
  cooked: {
    text: "조리완료",
    icon: IMAGE_CONSTANTS.BTNPLUS,
  },
  served: {
    text: "서빙완료",
    icon: IMAGE_CONSTANTS.BTNMINUS,
  },
};

interface OrderStateBtnProps {
  isBill?: boolean;
  status: OrderStatus; // 현재 상태를 직접 받음
  onStatusChange: (newStatus: OrderStatus) => void; // 상태 변경 콜백은 필수
}
const OrderStateBtn = ({
  isBill,
  status,
  onStatusChange,
}: OrderStateBtnProps) => {
  const { viewMode } = useLiveOrderStore();
  // iOS 크롬 대응: 터치 이벤트 최적화
  const [isProcessing, setIsProcessing] = useState(false);
  // 2. 내부 로직을 영어 타입 기준으로 수정
  const getNextStatus = (
    currentStatus: OrderStatus,
    mode: OrderViewMode
  ): OrderStatus | null => {
    if (mode === "kitchen") {
      switch (currentStatus) {
        case "pending":
          return "cooked";
        case "cooked":
        case "served":
          return null;
      }
    } else if (mode === "serving") {
      switch (currentStatus) {
        case "pending":
          return null;
        case "cooked":
          return "served";
        case "served":
          return "cooked";
      }
    }
    return null;
  };

  const nextStatus = getNextStatus(status, viewMode);
  const isDisabled = nextStatus === null;

  const handleClick = async () => {
    // iOS 크롬 대응: 중복 클릭 방지
    if (isProcessing || !nextStatus) return;

    setIsProcessing(true);

    try {
      // iOS 크롬 대응: 약간의 지연을 두어 터치 이벤트가 제대로 처리되도록 함
      await new Promise((resolve) => setTimeout(resolve, 50));

      onStatusChange(nextStatus);
    } catch (error) {
      console.error("OrderStateBtn handleClick error:", error);
    } finally {
      // iOS 크롬 대응: 처리 완료 후 상태 리셋
      setTimeout(() => setIsProcessing(false), 200);
    }
  };

  // iOS 크롬 대응: 터치 이벤트 핸들러 추가
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    handleClick();
  };

  const { text, icon } = STATUS_CONFIG[status];

  return (
    <Btn
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      $orderStatus={status}
      $isBill={isBill}
      $isDisabled={isDisabled}
      disabled={isDisabled}
    >
      {icon && <img src={icon} alt={`${text} 아이콘`} />}
      <BtnText>{text}</BtnText> {/* 화면에는 한글 텍스트 표시 */}
    </Btn>
  );
};

export default OrderStateBtn;

interface BtnProps {
  $isBill?: boolean;
  $orderStatus: OrderStatus;
  $isDisabled: boolean;
}
const Btn = styled.button<BtnProps>`
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  min-width: ${({ $isBill }) => ($isBill ? "58px" : "76px")};
  min-height: ${({ $isBill }) => ($isBill ? "18px" : "24px")};
  padding: ${({ $isBill }) => ($isBill ? "4px 6px" : "6px 10px")};
  box-sizing: border-box;

  border-radius: 24.427px;
  border: none; // border 추가
  touch-action: manipulation;
  z-index: 10;

  // iOS 크롬 대응: 터치 영역 확대
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;

  background: ${({ $orderStatus, theme }) => {
    switch ($orderStatus) {
      case "pending":
        return "rgba(255, 110, 63, 0.2)";
      case "cooked":
        return "rgba(255, 210, 50, 0.5)";
      case "served":
        return theme.colors.Orange01;
      default:
        return theme.colors.Orange02;
    }
  }};

  color: ${({ $orderStatus, theme }) => {
    switch ($orderStatus) {
      case "pending":
      case "cooked":
        return theme.colors.Orange01;
      case "served":
        return theme.colors.Bg;
      default:
        return theme.colors.Orange01;
    }
  }};

  ${({ theme, $isBill }) =>
    $isBill ? theme.fonts.SemiBold10 : theme.fonts.SemiBold12}

  gap: 2.7px;

  cursor: ${({ $isDisabled }) => ($isDisabled ? "not-allowed" : "pointer")};

  & img {
    width: 12px;
    height: 12px;
    pointer-events: none;
  }
`;

const BtnText = styled.div`
  white-space: nowrap;
  line-height: 12px;
  pointer-events: none;
`;
