import * as S from "../MyPage.styled";

type Props = {
    editing: boolean;
    onEdit: () => void;
    onConfirm: () => void;
    onCancel: () => void;
};

const FieldActions = ({ editing, onEdit, onConfirm, onCancel }: Props) => {
    return editing ? (
        <>
        <S.ConfirmButton onClick={onConfirm}><span>확인</span></S.ConfirmButton>
        <S.CancelButton onClick={onCancel}><span>취소</span></S.CancelButton>
        </>
    ) : (
        <S.ModifyButton onClick={onEdit}><span>수정</span></S.ModifyButton>
    );
};

export default FieldActions;
