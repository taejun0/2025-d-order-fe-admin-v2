import InfoRow from "./InfoRow";
import * as S from "../MyPage.styled";

const ReadonlyField = ({ label, value }: { label: string; value?: string | number | null }) => {
    return (
        <InfoRow label={label}>
        <S.Value>{value ?? "-"}</S.Value>
        </InfoRow>
    );
};
export default ReadonlyField;
