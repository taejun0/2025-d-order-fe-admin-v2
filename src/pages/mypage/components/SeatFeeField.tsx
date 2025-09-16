import React from "react";
import InfoRow from "./InfoRow"; // or "./infoRow"
import * as S from "../MyPage.styled";
import FieldActions from "./FieldActions";
import Dropdown from "./Dropdown";
import drop from "../../../assets/icons/drop.svg";

type Props = {
    editing: boolean;

    seatTypeLabel: string; // "인원 수" | "테이블" | "받지 않음"
    setSeatTypeLabel: (label: string) => void;

    amount: string;
    setAmount: (v: string) => void;

    readonlyType?: "PP" | "PT" | "NO";
    readonlyPP?: number | null | undefined;
    readonlyPT?: number | null | undefined;

    isDropdownOpen: boolean;
    // ✅ 수정: Dispatch<SetStateAction<boolean>>
    setDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>;

    onEdit: () => void;
    onConfirm: () => void;
    onCancel: () => void;
};

const OPTIONS = ["인원 수", "테이블", "받지 않음"];

const SeatFeeField = ({
    editing,
    seatTypeLabel, setSeatTypeLabel,
    amount, setAmount,
    readonlyType, readonlyPP, readonlyPT,
    isDropdownOpen, setDropdownOpen,
    onEdit, onConfirm, onCancel
    }: Props) => {
    return (
        <InfoRow label="테이블 이용료">
        {editing ? (
            <>
            <S.BanckContainer>
                <S.ColorSection>{seatTypeLabel}</S.ColorSection>
                <S.DropButton onClick={() => setDropdownOpen(prev => !prev)}>
                <img src={drop} alt="dropdown" />
                </S.DropButton>
                {isDropdownOpen && (
                <S.DropdownWrapper>
                    <Dropdown
                        value={seatTypeLabel}
                        options={OPTIONS}
                        placeholder="유형 선택"
                        isOpen={isDropdownOpen}
                        setIsOpen={setDropdownOpen}
                        onChange={(e) => {
                            const v = e.target.value;
                            setSeatTypeLabel(v);
                            if (v === "받지 않음") {
                            setAmount("");          // ✅ 금액 즉시 초기화
                            }
                            setDropdownOpen(false);
                        }}
                    />
                </S.DropdownWrapper>
                )}
            </S.BanckContainer>

            {seatTypeLabel !== "받지 않음" && (
                <S.AccountInput
                placeholder="금액"
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ""))}
                />
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
                <S.FeeTag>-</S.FeeTag>
                <S.Value>-</S.Value>
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
