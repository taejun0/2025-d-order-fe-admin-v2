import React from "react";
import InfoRow from "./InfoRow"; // or "./infoRow"
import * as S from "../MyPage.styled";
import FieldActions from "./FieldActions";
import Dropdown from "./Dropdown";
import drop from "../../../assets/icons/drop.svg";

const BANKS = [
    "KB 국민은행",
    "신한은행",
    "우리은행",
    "하나은행",
    "NH 농협은행",
    "IBK 기업은행",
    "SC 제일은행",
    "카카오뱅크",
    "토스뱅크",
    "케이뱅크",
    "우체국",
];

type Props = {
    editing: boolean;

    bank: string;
    setBank: (v: string) => void;
    owner: string;
    setOwner: (v: string) => void;
    account: string;
    setAccount: (v: string) => void;

    isDropdownOpen: boolean;
    // ✅ 수정: Dispatch<SetStateAction<boolean>>
    setDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>;

    readonlyBank?: string;
    readonlyOwner?: string;
    readonlyAccount?: string;

    onEdit: () => void;
    onConfirm: () => void;
    onCancel: () => void;
};

const AccountField = ({
    editing,
    bank, setBank, owner, setOwner, account, setAccount,
    isDropdownOpen, setDropdownOpen,
    readonlyBank, readonlyOwner, readonlyAccount,
    onEdit, onConfirm, onCancel
    }: Props) => {
    return (
        <InfoRow label="결제 계좌">
        {editing ? (
            <>
            <S.BanckContainer>
                <S.ColorSection>{bank || "은행 선택"}</S.ColorSection>
                <S.DropButton onClick={() => setDropdownOpen(prev => !prev)}>
                <img src={drop} alt="dropdown" />
                </S.DropButton>
                {isDropdownOpen && (
                <S.DropdownWrapper>
                    <Dropdown
                    value={bank}
                    options={BANKS}
                    placeholder="은행 선택"
                    isOpen={isDropdownOpen}
                    setIsOpen={setDropdownOpen} // ✅ 타입 일치
                    onChange={(e) => { setBank(e.target.value); setDropdownOpen(false); }}
                    />
                </S.DropdownWrapper>
                )}
            </S.BanckContainer>
            <S.Input
                placeholder="예금주"
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
            />
            <S.AccountInput
                placeholder="계좌번호"
                value={account}
                onChange={(e) => setAccount(e.target.value)}
            />
            </>
        ) : (
            <>
            <S.ColorSection>{readonlyBank}</S.ColorSection>
            <S.OwnerTag>{readonlyOwner}</S.OwnerTag>
            <S.Value>{readonlyAccount}</S.Value>
            </>
        )}

        <div style={{ marginLeft: "auto", display: "flex", gap: "0.75rem", marginRight: "1.6875rem" }}>
            <FieldActions editing={editing} onEdit={onEdit} onConfirm={onConfirm} onCancel={onCancel} />
        </div>
        </InfoRow>
    );
};

export default AccountField;
