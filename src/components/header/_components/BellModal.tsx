import * as S from "./BellModal.styled";

interface BellModalProps {
  $active: boolean;
  notifications: { id: number; message: string }[];
}

const BellModal = ({ $active, notifications }: BellModalProps) => {
  return (
    // 모달 내부 클릭 시 외부 클릭으로 인식되지 않게 설정핑
    <S.BellModalWrapper $active={$active} onClick={(e) => e.stopPropagation()}>
      {notifications.length === 0 ? (
        <S.DefaultText>알림이 없습니다.</S.DefaultText>
      ) : (
        notifications
          .slice(0, 7)
          .map((n) => <S.ContentsBox key={n.id}>{n.message}</S.ContentsBox>)
      )}
    </S.BellModalWrapper>
  );
};

export default BellModal;
