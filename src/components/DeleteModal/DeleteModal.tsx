//메뉴 삭제나 쿠폰 삭제 시 뜨는 모달입니다.
import * as S from "./DeleteModal.styled";

export const DeleteModal = ({
  onCancel,
  onDelete,
  Title,
  SubText1,
  SubText2,
  BtnName,
}: {
  onCancel: () => void;
  onDelete: () => void;
  Title: string;
  SubText1: string;
  SubText2: string;
  BtnName: string;
}) => {
  return (
    <S.Overlay onClick={onCancel}>
      <S.Container onClick={(e) => e.stopPropagation()}>
        <S.TextWrapper>
          <S.Title>{Title}</S.Title>
          <S.SubTitle>{SubText1}</S.SubTitle>
          <S.SubTitle>{SubText2}</S.SubTitle>
        </S.TextWrapper>

        <S.Bottom>
          <S.Cancel onClick={onCancel}>취소</S.Cancel>
          <S.Logout onClick={onDelete}>{BtnName}</S.Logout>
        </S.Bottom>
      </S.Container>
    </S.Overlay>
  );
};
