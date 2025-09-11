import * as S from "./MyPage.styled";
import { useState, useEffect } from "react";
import InfoRowComponent from "./components/InfoRow";
import logout from "../../assets/icons/logout.svg";
import qr from "../../assets/icons/qr.svg";
import Modal from "./components/Modal";
import { toast } from "react-toastify";
import check from "../../assets/icons/toastcheck.svg";
import drop from "../../assets/icons/drop.svg";
import CommonDropdown from "../signup/_components/inputs/dropdown/CommonDropdown";
import { LoadingSpinner } from "../menu/api/LoadingSpinner";
import styled from "styled-components";

// ⬇️ 새 훅/타입: useManagers (GET/PATCH)
import { useManagers } from "./hooks/useManagers";
import type { ManagerInfo } from "./apis/getManagers";

// ⬇️ QR 다운로드/로그아웃은 기존 서비스 사용 (명세 외 기능)
import MyPageService from "./apis/MyPageService";

const StyledDropdown = styled(CommonDropdown)`
  div,
  input,
  button {
    border-radius: 5px !important;
  }

  select {
    border-radius: 5px !important;
  }

  option[value=""] {
    color: ${({ theme }) => theme.colors.Black02};
  }
`;

const MyPage = () => {
  // 새 훅으로 교체
  const { data: my, loading, error, update, reload } = useManagers();

  const [editingName, setEditingName] = useState(false);
  const [editingAccount, setEditingAccount] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // 입력 상태
  const [storeName, setStoreName] = useState("");
  const [selectedBank, setSelectedBank] = useState("");
  const [owner, setOwner] = useState("");
  const [account, setAccount] = useState("");

  // my 갱신 시 로컬 입력 동기화(편집 시작 전에 베이스 값 보관용)
  useEffect(() => {
    if (!my) return;
    if (!editingName) setStoreName(my.booth_name ?? "");
    if (!editingAccount) {
      setSelectedBank(my.bank ?? "");
      setOwner(my.depositor ?? "");
      setAccount(my.account ?? "");
    }
  }, [my, editingName, editingAccount]);

  const handleBankChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedBank(e.target.value);
    setIsDropdownOpen(false);
  };

  const handleModifyClick = (field: "storeName" | "account") => {
    if (!my) return;
    if (field === "storeName") {
      setEditingName(true);
      setStoreName(my.booth_name ?? "");
    }
    if (field === "account") {
      setEditingAccount(true);
      setSelectedBank(my.bank ?? "");
      setOwner(my.depositor ?? "");
      setAccount(my.account ?? "");
    }
  };

  const handleCancelClick = (field: "storeName" | "account") => {
    if (!my) return;
    if (field === "storeName") {
      setEditingName(false);
      setStoreName(my.booth_name ?? "");
    }
    if (field === "account") {
      setEditingAccount(false);
      setSelectedBank(my.bank ?? "");
      setOwner(my.depositor ?? "");
      setAccount(my.account ?? "");
    }
  };

  const handleConfirmClick = async (field: "storeName" | "account") => {
    if (!my) return;

    try {
      const payload: Partial<ManagerInfo> = {};

      if (field === "storeName") {
        payload.booth_name = storeName?.trim();
      }

      if (field === "account") {
        payload.bank = selectedBank?.trim();
        payload.depositor = owner?.trim();
        payload.account = account?.trim();
      }

      const res = await update(payload, { normalizeSeat: false });
      if (!res) return;

      toast.success("저장되었습니다.", {
        icon: <img src={check} alt="체크" />,
        closeButton: false,
        style: {
          backgroundColor: "#FF6E3F",
          color: "#FAFAFA",
          fontSize: "1rem",
          fontWeight: "800",
          borderRadius: "8px",
          padding: "0.75rem 0.875rem",
        },
      });

      if (field === "storeName") setEditingName(false);
      if (field === "account") setEditingAccount(false);
    } catch (e) {
      toast.error("수정 중 오류가 발생했습니다.", {
        closeButton: false,
        style: {
          backgroundColor: "#FF6E3F",
          color: "#FAFAFA",
          fontSize: "1rem",
          fontWeight: "800",
          borderRadius: "8px",
          padding: "0.75rem 0.875rem",
        },
      });
    }
  };

  const handleQrClick = async () => {
    if (!my) return;

    try {
      await MyPageService.downloadQrCode(my.booth);
      toast.success("QR코드 다운로드가 완료되었어요!", {
        icon: <img src={check} alt="체크" />,
        closeButton: false,
        style: {
          backgroundColor: "#FF6E3F",
          color: "#FAFAFA",
          fontSize: "1rem",
          fontWeight: "800",
          borderRadius: "8px",
          padding: "0.75rem 0.875rem",
        },
      });
    } catch {
      toast.error("QR코드 다운로드에 실패했습니다.", {
        closeButton: false,
        style: {
          backgroundColor: "#FF6E3F",
          color: "#FAFAFA",
          fontSize: "1rem",
          fontWeight: "800",
          borderRadius: "8px",
          padding: "0.75rem 0.875rem",
        },
      });
    }
  };

  // 로그아웃 처리
  const handleLogout = async () => {
    try {
      await MyPageService.logout();
      toast.success("로그아웃되었습니다.", {
        closeButton: false,
        style: {
          backgroundColor: "#FF6E3F",
          color: "#FAFAFA",
          fontSize: "1rem",
          fontWeight: "800",
          borderRadius: "8px",
          padding: "0.75rem 0.875rem",
        },
      });
      window.location.href = "/login";
    } catch {
      toast.error("로그아웃에 실패했습니다.", {
        closeButton: false,
        style: {
          backgroundColor: "#FF6E3F",
          color: "#FAFAFA",
          fontSize: "1rem",
          fontWeight: "800",
          borderRadius: "8px",
          padding: "0.75rem 0.875rem",
        },
      });
      window.location.href = "/login";
    } finally {
      setShowLogoutModal(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div>{error}</div>;
  if (!my) return <div>주점 정보를 불러올 수 없습니다.</div>;

  return (
    <S.Wrapper>
      <S.Title>주점 정보</S.Title>
      <S.Container>
        <S.Row>
          {/* 주점명 */}
          <InfoRowComponent label="주점명">
            {editingName ? (
              <S.NameInput
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
              />
            ) : (
              <S.Value>{my.booth_name}</S.Value>
            )}
            <S.ButtonGroup>
              {editingName ? (
                <>
                  <S.ConfirmButton onClick={() => handleConfirmClick("storeName")}>
                    <span>확인</span>
                  </S.ConfirmButton>
                  <S.CancelButton onClick={() => handleCancelClick("storeName")}>
                    <span>취소</span>
                  </S.CancelButton>
                </>
              ) : (
                <S.ModifyButton onClick={() => handleModifyClick("storeName")}>
                  <span>수정</span>
                </S.ModifyButton>
              )}
            </S.ButtonGroup>
          </InfoRowComponent>

          {/* 테이블 수 */}
          <InfoRowComponent label="테이블 수">
            <S.Value>{my.table_num}</S.Value>
          </InfoRowComponent>

          {/* 테이블 이용료 */}
          <InfoRowComponent label="테이블 이용료">
            {my.seat_type === "PP" && (
              <>
                <S.FeeTag>인원 수</S.FeeTag>
                <S.Value>
                  {my.seat_tax_person ? `${my.seat_tax_person.toLocaleString()}원` : "-"}
                </S.Value>
              </>
            )}
            {my.seat_type === "PT" && (
              <>
                <S.FeeTag>테이블</S.FeeTag>
                <S.Value>
                  {my.seat_tax_table ? `${my.seat_tax_table.toLocaleString()}원` : "-"}
                </S.Value>
              </>
            )}
            {my.seat_type === "NO" && (
              <>
                <S.FeeTag>-</S.FeeTag>
                <S.Value>-</S.Value>
              </>
            )}
          </InfoRowComponent>

          {/* 결제 계좌 */}
          <InfoRowComponent label="결제 계좌">
            {editingAccount ? (
              <>
                <S.BanckContainer>
                  <S.BankTag>{selectedBank || "은행 선택"}</S.BankTag>
                  <S.DropButton onClick={() => setIsDropdownOpen((prev) => !prev)}>
                    <img src={drop} alt="dropdown" />
                  </S.DropButton>
                  {isDropdownOpen && (
                    <S.DropdownWrapper>
                      <StyledDropdown
                        label=""
                        placeholder="은행 선택"
                        value={selectedBank}
                        onChange={handleBankChange}
                        options={[
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
                        ]}
                        radius="5px"
                        isOpen={isDropdownOpen}
                        setIsOpen={setIsDropdownOpen}
                      />
                    </S.DropdownWrapper>
                  )}
                </S.BanckContainer>
                <S.Input
                  type="text"
                  placeholder="예금주"
                  value={owner}
                  onChange={(e) => setOwner(e.target.value)}
                />
                <S.AccountInput
                  type="text"
                  placeholder="계좌번호"
                  value={account}
                  onChange={(e) => setAccount(e.target.value)}
                />
              </>
            ) : (
              <>
                <S.BankTag>{my.bank}</S.BankTag>
                <S.OwnerTag>{my.depositor}</S.OwnerTag>
                <S.Value>{my.account}</S.Value>
              </>
            )}
            <S.ButtonGroup>
              {editingAccount ? (
                <>
                  <S.ConfirmButton onClick={() => handleConfirmClick("account")}>
                    <span>확인</span>
                  </S.ConfirmButton>
                  <S.CancelButton onClick={() => handleCancelClick("account")}>
                    <span>취소</span>
                  </S.CancelButton>
                </>
              ) : (
                <S.ModifyButton onClick={() => handleModifyClick("account")}>
                  <span>수정</span>
                </S.ModifyButton>
              )}
            </S.ButtonGroup>
          </InfoRowComponent>

          {/* 주문 확인 비밀번호 */}
          <InfoRowComponent label="주문 확인 비밀번호">
            <S.Value>{my.order_check_password || "-"}</S.Value>
          </InfoRowComponent>
        </S.Row>
      </S.Container>

      {/* 하단 액션 */}
      <S.BottomContainer>
        <S.QrContainer onClick={handleQrClick}>
          <S.QrImg src={qr} />
          <span>QR 코드 다운로드</span>
        </S.QrContainer>
        <S.LogoutContainer onClick={() => setShowLogoutModal(true)}>
          <S.LogoutImg src={logout} />
          <span>로그아웃</span>
        </S.LogoutContainer>
      </S.BottomContainer>

      {showLogoutModal && (
        <Modal onCancel={() => setShowLogoutModal(false)} onLogout={handleLogout} />
      )}
    </S.Wrapper>
  );
};

export default MyPage;
