import InfoRow from "./InfoRow";
import * as S from "../MyPage.styled";
import FieldActions from "./FieldActions";

type Props = {
    value?: string;
    editing: boolean;
    input: string;
    setInput: (v: string) => void;
    onEdit: () => void;
    onConfirm: () => void;
    onCancel: () => void;
};

const StoreNameField = ({
    value, editing, input, setInput, onEdit, onConfirm, onCancel
    }: Props) => {
    return (
        <InfoRow label="주점명">
        {editing ? (
            <>
            <S.NameInput value={input} onChange={(e) => setInput(e.target.value)} />
            <div style={{ marginLeft: "auto", display: "flex", gap: "0.75rem", marginRight: "1.6875rem" }}>
                <FieldActions editing={editing} onEdit={onEdit} onConfirm={onConfirm} onCancel={onCancel} />
            </div>
            </>
        ) : (
            <>
            <S.Value>{value || "-"}</S.Value>
            <div style={{ marginLeft: "auto", display: "flex", gap: "0.75rem", marginRight: "1.6875rem" }}>
                <FieldActions editing={editing} onEdit={onEdit} onConfirm={onConfirm} onCancel={onCancel} />
            </div>
            </>
        )}
        </InfoRow>
    );
};
export default StoreNameField;
