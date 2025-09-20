// src/pages/liveorder_v2/_components/OrderStateBtn.tsx

import styled from "styled-components";
import { IMAGE_CONSTANTS } from "@constants/imageConstants";
import { useLiveOrderStore, OrderViewMode } from "../LiveOrderStore";
import { OrderStatus } from "../types";
import { useState } from "react";

const STATUS_CONFIG = {
  pending: {
    text: "준비중",
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
  status: OrderStatus;
  onStatusChange: (newStatus: OrderStatus) => void;
}
const OrderStateBtn = ({
  isBill,
  status,
  onStatusChange,
}: OrderStateBtnProps) => {
  const { viewMode } = useLiveOrderStore();
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
    if (isProcessing || !nextStatus) {
      return;
    }

    setIsProcessing(true);
    try {
      onStatusChange(nextStatus);
    } catch (error) {
      console.error("OrderStateBtn handleClick error:", error);
    } finally {
      setTimeout(() => {
        setIsProcessing(false);
      }, 500);
    }
  };

  const { text, icon } = STATUS_CONFIG[status];

  return (
    <Btn
      onClick={handleClick}
      $orderStatus={status}
      $isBill={isBill}
      $isDisabled={isDisabled}
      disabled={isDisabled}
    >
      {icon && <img src={icon} alt={`${text} 아이콘`} />}
      <BtnText>{text}</BtnText>
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
  border: none;
  touch-action: manipulation;
  z-index: 10;

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
