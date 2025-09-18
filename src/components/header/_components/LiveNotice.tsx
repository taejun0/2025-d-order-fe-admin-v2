import styled from "styled-components";

import { IMAGE_CONSTANTS } from "@constants/imageConstants";

interface LiveNoticeProps {
  message: string;
  show: boolean;
}

const LiveNotice = ({ message, show }: LiveNoticeProps) => {
  return (
    <Wrapper $show={show}>
      {message}
      <img
        src={IMAGE_CONSTANTS.BELL}
        alt="종모양 아이콘"
        style={{ width: "14px", height: "14px", display: "flex" }}
      />
    </Wrapper>
  );
};

export default LiveNotice;

const Wrapper = styled.div<{ $show: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;

  min-width: 300px;
  height: 35px;

  padding: 0 11px;
  box-sizing: border-box;

  border-radius: 20px;
  border: 1px solid;
  border-color: ${({ theme }) => theme.colors.Orange01};
  ${({ theme }) => theme.fonts.SemiBold16}
  color: ${({ theme }) => theme.colors.Black01};

  gap: 4px;

  /* 애니메이션 효과 */
  opacity: ${({ $show }) => ($show ? 1 : 0)};
  transition: opacity 0.5s ease-in-out;
`;
