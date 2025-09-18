import styled from "styled-components";

export const Wrapper = styled.div`
  box-sizing: border-box;

  display: flex;
  flex-direction: column !important;
  gap: 0px !important;
  position: relative;
  width: 100%;
`;

export const SelectBox = styled.div<{ $isOpen: boolean; $radius?: string }>`
  ${({ theme }) => theme.fonts.SemiBold16};
  width: 100%;
  box-sizing: border-box;
  padding: 14px;
  border: 1px solid rgba(192, 192, 192, 0.5);

  background-color: ${({ theme }) => theme.colors.Bg};
  color: ${({ theme }) => theme.colors.Black01};
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  border-radius: ${({ $isOpen, $radius }) =>
    $isOpen
      ? `${$radius || "25px"} ${$radius || "25px"} 0 0`
      : $radius || "25px"};
  z-index: 50;
`;

export const ArrowIcon = styled.img<{ $isOpen: boolean }>`
  width: 24px;
  height: 24px;
  transform: rotate(${({ $isOpen }) => ($isOpen ? "0deg" : "180deg")});
  transition: transform 0.2s ease-in-out;
`;

export const OptionBox = styled.ol`
  width: 100%;
  border-radius: 0 0 10px 10px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
  position: absolute;
  top: 100%;
  z-index: 100;
`;

export const Option = styled.li`
  list-style-type: none;
  padding: 20px;
  cursor: pointer;
  ${({ theme }) => theme.fonts.SemiBold16};
  color: ${({ theme }) => theme.colors.Black01};
  border: 1px solid rgba(192, 192, 192, 0.5);
  background-color: ${({ theme }) => theme.colors.Bg};
  &:not(.disabled)hover {
    background-color: ${({ theme }) => theme.colors.Orange02};
    color: ${({ theme }) => theme.colors.Orange01};
  }
  &:last-child {
    border-radius: 0 0 10px 10px;
  }

  &.disabled {
    color: ${({ theme }) => theme.colors.Black02};
    cursor: default;
    background-color: ${({ theme }) => theme.colors.Bg};
  }
`;

export const AmountWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
  margin-top: 12px;
  gap: 4px;
`;

export const Button = styled.button``;
