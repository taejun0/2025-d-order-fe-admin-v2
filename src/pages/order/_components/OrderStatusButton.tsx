import styled from "styled-components";
import { OrderItem, OrderStatus } from "../types/orderTypes";

interface ButtonProps {
  viewType: "kitchen" | "serving";
  order: OrderItem;
  onCook: () => void;
  onServe: () => void;
  onRevert: () => void;
}

const getButtonProps = (status: OrderStatus) => {
  switch (status) {
    case "preparing":
      return { text: "준비중", color: "#FFB800" };
    case "cooked":
      return { text: "조리완료", color: "#00A3FF" };
    case "served":
      return { text: "서빙완료", color: "#8A8A8A" };
    default:
      return { text: "알수없음", color: "#000000" };
  }
};
const StyledButton = styled.button<{ $color: string }>`
  padding: 8px 12px;
  min-width: 80px;
  border-radius: 5px;
  border: none;
  color: white;
  font-weight: bold;
  cursor: pointer;
  background-color: ${({ $color }) => $color};
  transition: opacity 0.2s ease;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  &:not(:disabled):hover {
    opacity: 0.8;
  }
`;
const OrderStatusButton = ({
  viewType,
  order,
  onCook,
  onServe,
  onRevert,
}: ButtonProps) => {
  const { text, color } = getButtonProps(order.status);

  let onClick = () => {};
  let disabled = true;

  if (viewType === "kitchen") {
    if (order.status === "preparing") {
      onClick = onCook;
      disabled = false;
    }
  } else {
    // serving view
    if (order.status === "cooked") {
      onClick = onServe;
      disabled = false;
    } else if (order.status === "served") {
      onClick = onRevert;
      disabled = false;
    }
  }

  return (
    <StyledButton $color={color} disabled={disabled} onClick={onClick}>
      {text}
    </StyledButton>
  );
};

export default OrderStatusButton;
