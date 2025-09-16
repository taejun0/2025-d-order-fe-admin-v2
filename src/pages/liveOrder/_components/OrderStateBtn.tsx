import styled from "styled-components";
import { IMAGE_CONSTANTS } from "@constants/imageConstants";

interface OrderStateBtnProps {
  isBill?: boolean;
  isChecked: boolean;
  onClick?: () => void;
}

const OrderStateBtn = ({ isBill, isChecked, onClick }: OrderStateBtnProps) => {
  return (
    <Btn onClick={onClick} $isChecked={isChecked} $isBill={isBill}>
      <img
        src={isChecked ? IMAGE_CONSTANTS.BTNCHECK : IMAGE_CONSTANTS.BTNPLUS}
        alt="icon"
      />

      <BtnText>{isChecked ? "서빙완료" : "준비중"}</BtnText>
    </Btn>
  );
};

export default OrderStateBtn;

interface BtnProps {
  $isBill?: boolean;
  $isChecked: boolean;
}

const Btn = styled.button<BtnProps>`
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;

  padding: 4px 10px;
  box-sizing: border-box;

  border-radius: 24.427px;
  background: ${({ $isChecked, theme }) =>
    $isChecked
      ? theme.colors.Orange01
      : "rgba(255, 110, 63, 0.2)"}; /* 배경색 변경 */

  color: ${({ $isChecked, theme }) =>
    $isChecked ? theme.colors.Bg : theme.colors.Orange01}; /* 글씨색 변경 */
  ${({ theme, $isBill }) =>
    $isBill ? theme.fonts.SemiBold10 : theme.fonts.SemiBold12}

  gap: 2.7px;
  & img {
    width: 12px;
    height: 12px;
  }
`;

const BtnText = styled.div`
  white-space: nowrap;
  line-height: 12px; /* 아이콘 height와 맞춤 */
`;
