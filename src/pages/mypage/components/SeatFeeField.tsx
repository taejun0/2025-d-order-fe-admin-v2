// mypage/components/SeatFeeField.tsx
import React from "react";
import InfoRow from "./InfoRow";
import * as S from "../MyPage.styled";
import FieldActions from "./FieldActions";

type Props = {
    editing: boolean;

    seatTypeLabel: string;              // "인원 수" | "테이블" | "받지 않음"
    setSeatTypeLabel?: (label: string) => void; // ❗️수정불가 → 사용 안함(호환용)

    amount: string;
    setAmount: (v: string) => void;

    readonlyType?: "PP" | "PT" | "NO";
    readonlyPP?: number | null | undefined;
    readonlyPT?: number | null | undefined;

    isDropdownOpen?: boolean; // ❗️수정불가 → 사용 안함(호환용)
    setDropdownOpen?: React.Dispatch<React.SetStateAction<boolean>>; // ❗️사용 안함

    onEdit: () => void;
    onConfirm: () => void;
    onCancel: () => void;
};

const SeatFeeField = ({
    editing,
    seatTypeLabel,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    // setSeatTypeLabel,
    amount, setAmount,
    readonlyType, readonlyPP, readonlyPT,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    // isDropdownOpen,
    // // eslint-disable-next-line @typescript-eslint/no-unused-vars
    // setDropdownOpen,
    onEdit, onConfirm, onCancel
    }: Props) => {
    return (
        <InfoRow label="테이블 이용료">
        {editing ? (
            <>
            {/* ✅ 타입은 읽기 전용 표시만 하고, 드롭다운/버튼 제거 */}
            <S.BanckContainer>
                <S.ColorSection>{seatTypeLabel}</S.ColorSection>
            </S.BanckContainer>

            {/* 타입이 '받지 않음'이 아닐 때만 금액 입력 허용 */}
            {seatTypeLabel !== "받지 않음" ? (
                <S.AccountInput
                placeholder="금액"
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ""))}
                />
            ) : (
                <S.Value style={{ marginLeft: "0.75rem" }}>이용료 없음</S.Value>
            )}
            </>
        ) : (
            <>
            {readonlyType === "PP" && (
                <>
                <S.FeeTag>인원 수</S.FeeTag>
                <S.Value>{readonlyPP ? `${readonlyPP.toLocaleString()}원` : "-"}</S.Value>
                </>
            )}
            {readonlyType === "PT" && (
                <>
                <S.FeeTag>테이블</S.FeeTag>
                <S.Value>{readonlyPT ? `${readonlyPT.toLocaleString()}원` : "-"}</S.Value>
                </>
            )}
            {readonlyType === "NO" && (
                <>
                <S.FeeTag>받지 않음</S.FeeTag>
                <S.Value>0원</S.Value>
                </>
            )}
            </>
        )}

        <div style={{ marginLeft: "auto", display: "flex", gap: "0.75rem", marginRight: "1.6875rem" }}>
            <FieldActions editing={editing} onEdit={onEdit} onConfirm={onConfirm} onCancel={onCancel} />
        </div>
        </InfoRow>
    );
};

export default SeatFeeField;
