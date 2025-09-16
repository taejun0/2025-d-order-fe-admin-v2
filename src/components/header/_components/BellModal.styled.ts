import styled from "styled-components";

export const BellModalWrapper = styled.div<{ $active: boolean }>`
  display: flex;
  flex-direction: column;
  position: absolute;
  z-index: 2;
  top: 34px;
  right: 0;

  /* justify-content: center;
  align-items: center; */
  width: 218px;

  border-radius: 3px;
  border: solid 1px rgba(192, 192, 192, 0.5);
  background-color: ${({ theme }) => theme.colors.Bg};

  ${({ theme }) => theme.fonts.SemiBold12}
  color: ${({ theme }) => theme.colors.Black01};

  //모달 열고닫히는 애니메이션
  transform: scale(${(props) => (props.$active ? 1 : 0)});
  opacity: ${(props) => (props.$active ? 1 : 0)};
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s;

  pointer-events: ${(props) => (props.$active ? "auto" : "none")};
`;
export const DefaultText = styled.div`
  display: flex;
  width: 100%;
  min-height: 64px;
  justify-content: center;
  align-items: center;
`;
export const ContentsBox = styled.div`
  display: flex;
  align-items: center;
  padding: 0 13px;
  box-sizing: border-box;
  width: 100%;
  height: 32px;
  border-bottom: 1px solid rgba(192, 192, 192, 0.5);

  ${({ theme }) => theme.fonts.SemiBold10}
  color: ${({ theme }) => theme.colors.Black01};

  &:last-child {
    border-bottom: none; /* 마지막 항목은 선 없음 */
  }
`;
