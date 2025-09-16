import styled from "styled-components";
import { useRef, useEffect } from "react";
import { IMAGE_CONSTANTS } from "@constants/imageConstants";

import BellModal from "./BellModal";

interface BellProps {
  active: boolean; // 종 활성화 여부
  onClick: () => void;
  modalOpen: boolean;
  notifications: { id: number; message: string }[];
  onCloseModal: () => void; // 모달 닫기 함수 (Header로부터 받음)
}

const Bell = ({
  active,
  onClick,
  modalOpen,
  notifications,
  onCloseModal,
}: BellProps) => {
  const bellWrapperRef = useRef<HTMLButtonElement>(null);
  // BellWrapper에 대한 ref

  // 모달 외부 클릭 감지 로직 (Bell 컴포넌트 내부에서 처리)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // bellWrapperRef.current에 클릭된 요소가 포함되어 있지 않으면 모달을 닫음
      // 즉, 벨 아이콘과 모달 영역 '밖'을 클릭했을 때 모달이 닫힘
      if (
        bellWrapperRef.current &&
        !bellWrapperRef.current.contains(event.target as Node)
      ) {
        onCloseModal(); // 부모로부터 받은 모달 닫기 함수 호출
      }
    };

    if (modalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [modalOpen, onCloseModal]);

  return (
    <BellWrapper ref={bellWrapperRef} onClick={onClick}>
      <img src={IMAGE_CONSTANTS.BELL} alt="알림 종 아이콘" />
      <Dot $active={active} />
      <BellModal $active={modalOpen} notifications={notifications} />
    </BellWrapper>
  );
};

export default Bell;

const BellWrapper = styled.button`
  display: flex;
  width: 24px;
  height: 24px;
  justify-content: center;
  align-items: center;
  position: relative;
  cursor: pointer;
`;

const Dot = styled.div<{ $active: boolean }>`
  position: absolute;
  top: 0px;
  right: 0px;
  width: 6px;
  height: 6px;
  background: #ffd232;
  border-radius: 50%;
  z-index: 1;

  transform: scale(${(props) => (props.$active ? 1 : 0)});
  opacity: ${(props) => (props.$active ? 1 : 0)};
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s;
`;
