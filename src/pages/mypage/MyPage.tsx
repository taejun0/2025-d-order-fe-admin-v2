// mypage/MyPage.tsx
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

import { useManagers } from "./hooks/useManagers";
import { useManagerPatch } from "./hooks/useManagerPatch";
import type { ManagerInfo } from "./apis/getManagerPatch";
import { downloadManagerQR } from "./apis/getQRDownload";
import { requestLogout } from "./apis/logout";

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

// 좌석 타입 매핑
const SeatTypeLabel: Record<ManagerInfo["seat_type"], string> = {
  PP: "인원 수",
  PT: "테이블",
  NO: "받지 않음",
};
const LabelToSeatType: Record<string, ManagerInfo["seat_type"]> = {
  "인원 수": "PP",
  테이블: "PT",
  "받지 않음": "NO",
};

// 이용 시간 매핑 (분 ↔ 한글)
const minutesToLabel = (m?: number) => {
  switch (m) {
    case 60:
      return "1시간";
    case 90:
      return "1시간 30분";
    case 120:
      return "2시간";
    case 150:
      return "2시간 30분";
    case 180:
      return "3시간";
    default:
      return "2시간";
  }
};
const labelToMinutes = (label: string) => {
  switch (label) {
    case "1시간":
      return 60;
    case "1시간 30분":
      return 90;
    case "2시간":
      return 120;
    case "2시간 30분":
      return 150;
    case "3시간":
      return 180;
    default:
      return 120;
  }
};

type PatchField = "storeName" | "account" | "seat" | "time";

const MyPage = () => {
  const { data: my, loading, error, reload } = useManagers();
  const { update, updating, error: updateError } = useManagerPatch({ normalizeSeat: true });

  const [editingName, setEditingName] = useState(false);
  const [editingAccount, setEditingAccount] = useState(false);
  const [editingSeat, setEditingSeat] = useState(false);
  const [editingTime, setEditingTime] = useState(false);

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // 개별 드롭다운 open 상태
  const [isBankDropdownOpen, setIsBankDropdownOpen] = useState(false);
  const [isSeatDropdownOpen, setIsSeatDropdownOpen] = useState(false);
  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);

  // 입력 상태
  const [storeName, setStoreName] = useState("");
  const [selectedBank, setSelectedBank] = useState("");
  const [owner, setOwner] = useState("");
  const [account, setAccount] = useState("");

  // 좌석 과금 편집 상태
  const [seatTypeLocal, setSeatTypeLocal] = useState<ManagerInfo["seat_type"]>("NO");
  const [seatAmountLocal, setSeatAmountLocal] = useState<string>("");

  // 이용 시간 편집 상태
  const [timeLabelLocal, setTimeLabelLocal] = useState<string>("2시간");

  useEffect(() => {
    if (!my) return;

    if (!editingName) setStoreName(my.booth_name ?? "");
    if (!editingAccount) {
      setSelectedBank(my.bank ?? "");
      setOwner(my.depositor ?? "");
      setAccount(my.account ?? "");
    }
    if (!editingSeat) {
      setSeatTypeLocal(my.seat_type);
      const amt =
        my.seat_type === "PP"
          ? my.seat_tax_person ?? null
          : my.seat_type === "PT"
          ? my.seat_tax_table ?? null
          : null;
      setSeatAmountLocal(amt != null ? String(amt) : "");
    }
    if (!editingTime) {
      setTimeLabelLocal(minutesToLabel(my.table_limit_hours));
    }
  }, [my, editingName, editingAccount, editingSeat, editingTime]);

  const handleBankChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedBank(e.target.value);
    setIsBankDropdownOpen(false);
  };

  const handleSeatTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const label = e.target.value;
    const code = LabelToSeatType[label] ?? "NO";
    setSeatTypeLocal(code);
    if (code === "NO") setSeatAmountLocal("");
    setIsSeatDropdownOpen(false);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTimeLabelLocal(e.target.value);
    setIsTimeDropdownOpen(false);
  };

  const startEdit = (field: PatchField) => {
    if (!my) return;
    if (field === "storeName") {
      setEditingName(true);
      setStoreName(my.booth_name ?? "");
    } else if (field === "account") {
      setEditingAccount(true);
      setSelectedBank(my.bank ?? "");
      setOwner(my.depositor ?? "");
      setAccount(my.account ?? "");
    } else if (field === "seat") {
      setEditingSeat(true);
      setSeatTypeLocal(my.seat_type);
      const amt =
        my.seat_type === "PP"
          ? my.seat_tax_person ?? null
          : my.seat_type === "PT"
          ? my.seat_tax_table ?? null
          : null;
      setSeatAmountLocal(amt != null ? String(amt) : "");
    } else if (field === "time") {
      setEditingTime(true);
      setTimeLabelLocal(minutesToLabel(my.table_limit_hours));
    }
  };

  const cancelEdit = (field: PatchField) => {
    if (!my) return;
    if (field === "storeName") {
      setEditingName(false);
      setStoreName(my.booth_name ?? "");
    } else if (field === "account") {
      setEditingAccount(false);
      setSelectedBank(my.bank ?? "");
      setOwner(my.depositor ?? "");
      setAccount(my.account ?? "");
    } else if (field === "seat") {
      setEditingSeat(false);
      setSeatTypeLocal(my.seat_type);
      const amt =
        my.seat_type === "PP"
          ? my.seat_tax_person ?? null
          : my.seat_type === "PT"
          ? my.seat_tax_table ?? null
          : null;
      setSeatAmountLocal(amt != null ? String(amt) : "");
    } else if (field === "time") {
      setEditingTime(false);
      setTimeLabelLocal(minutesToLabel(my.table_limit_hours));
    }
  };

  const confirmEdit = async (field: PatchField) => {
    if (!my) return;

    const payload: Partial<ManagerInfo> = {};

    if (field === "storeName") {
      payload.booth_name = storeName?.trim();
    } else if (field === "account") {
      payload.bank = selectedBank?.trim();
      payload.depositor = owner?.trim();
      payload.account = account?.trim();
    } else if (field === "seat") {
      payload.seat_type = seatTypeLocal;

      if (seatTypeLocal === "PP") {
        payload.seat_tax_person = seatAmountLocal ? Number(seatAmountLocal) : 0;
        payload.seat_tax_table = null;
      } else if (seatTypeLocal === "PT") {
        payload.seat_tax_table = seatAmountLocal ? Number(seatAmountLocal) : 0;
        payload.seat_tax_person = null;
      } else {
        payload.seat_tax_person = null;
        payload.seat_tax_table = null;
      }
    } else if (field === "time") {
      payload.table_limit_hours = labelToMinutes(timeLabelLocal);
    }

    console.groupCollapsed(`[PATCH] /api/v2/manager/mypage/ - ${field}`);
    console.log("▶ payload", payload);

    try {
      const res = await update(payload);
      console.log("✔ response", res);

      if (!res) {
        toast.error(updateError || "수정 중 오류가 발생했습니다.", {
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
        console.groupEnd();
        return;
      }

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

      await reload();

      if (field === "storeName") setEditingName(false);
      if (field === "account") setEditingAccount(false);
      if (field === "seat") setEditingSeat(false);
      if (field === "time") setEditingTime(false);

      console.log("✔ reload() done");
    } catch (e: any) {
      console.error("✖ patch error", e);
      toast.error(e?.message || "수정 중 오류가 발생했습니다.", {
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
    } finally {
      console.groupEnd();
    }
  };

  const handleQrClick = async () => {
    if (!my) return;
    try {
      // manager_id 사용
      await downloadManagerQR(my.user);
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
    } catch (err: any) {
      toast.error(err?.message || "QR코드 다운로드에 실패했습니다.", {
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

  const handleLogout = async () => {
    try {
      await requestLogout();
      localStorage.removeItem("accessToken");
      localStorage.removeItem("access");
      localStorage.removeItem("token");

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
    } catch (err: any) {
      toast.error(err?.message || "로그아웃에 실패했습니다.", {
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

  if (loading || updating) return <LoadingSpinner />;
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
              <S.Value>{my.booth_name || "-"}</S.Value>
            )}
            <S.ButtonGroup>
              {editingName ? (
                <>
                  <S.ConfirmButton onClick={() => confirmEdit("storeName")}>
                    <span>확인</span>
                  </S.ConfirmButton>
                  <S.CancelButton onClick={() => cancelEdit("storeName")}>
                    <span>취소</span>
                  </S.CancelButton>
                </>
              ) : (
                <S.ModifyButton onClick={() => startEdit("storeName")}>
                  <span>수정</span>
                </S.ModifyButton>
              )}
            </S.ButtonGroup>
          </InfoRowComponent>

          {/* 테이블 수 (수정 불가) */}
          <InfoRowComponent label="테이블 수">
            <S.Value>{my.table_num}</S.Value>
          </InfoRowComponent>

          {/* 테이블 이용료 */}
          <InfoRowComponent label="테이블 이용료">
            {editingSeat ? (
              <>
                <S.BanckContainer>
                  <S.BankTag>{SeatTypeLabel[seatTypeLocal]}</S.BankTag>
                  <S.DropButton onClick={() => setIsSeatDropdownOpen((p) => !p)}>
                    <img src={drop} alt="dropdown" />
                  </S.DropButton>
                  {isSeatDropdownOpen && (
                    <S.DropdownWrapper>
                      <StyledDropdown
                        label=""
                        placeholder="유형 선택"
                        value={SeatTypeLabel[seatTypeLocal]}
                        onChange={handleSeatTypeChange}
                        options={["인원 수", "테이블", "받지 않음"]}
                        radius="5px"
                        isOpen={isSeatDropdownOpen}
                        setIsOpen={setIsSeatDropdownOpen}
                      />
                    </S.DropdownWrapper>
                  )}
                </S.BanckContainer>

                {seatTypeLocal !== "NO" && (
                  <S.AccountInput
                    type="text"
                    placeholder="금액"
                    value={seatAmountLocal}
                    onChange={(e) => setSeatAmountLocal(e.target.value.replace(/[^\d]/g, ""))}
                  />
                )}
              </>
            ) : (
              <>
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
              </>
            )}
            <S.ButtonGroup>
              {editingSeat ? (
                <>
                  <S.ConfirmButton onClick={() => confirmEdit("seat")}>
                    <span>확인</span>
                  </S.ConfirmButton>
                  <S.CancelButton onClick={() => cancelEdit("seat")}>
                    <span>취소</span>
                  </S.CancelButton>
                </>
              ) : (
                <S.ModifyButton onClick={() => startEdit("seat")}>
                  <span>수정</span>
                </S.ModifyButton>
              )}
            </S.ButtonGroup>
          </InfoRowComponent>

          {/* 테이블 이용 시간 */}
          <InfoRowComponent label="테이블 이용 시간">
            {editingTime ? (
              <>
                <S.BanckContainer>
                  <S.BankTag>{timeLabelLocal}</S.BankTag>
                  <S.DropButton onClick={() => setIsTimeDropdownOpen((p) => !p)}>
                    <img src={drop} alt="dropdown" />
                  </S.DropButton>
                  {isTimeDropdownOpen && (
                    <S.DropdownWrapper>
                      <StyledDropdown
                        label=""
                        placeholder="시간 선택"
                        value={timeLabelLocal}
                        onChange={handleTimeChange}
                        options={["1시간", "1시간 30분", "2시간", "2시간 30분", "3시간"]}
                        radius="5px"
                        isOpen={isTimeDropdownOpen}
                        setIsOpen={setIsTimeDropdownOpen}
                      />
                    </S.DropdownWrapper>
                  )}
                </S.BanckContainer>
              </>
            ) : (
              <S.Value>{minutesToLabel(my.table_limit_hours)}</S.Value>
            )}
            <S.ButtonGroup>
              {editingTime ? (
                <>
                  <S.ConfirmButton onClick={() => confirmEdit("time")}>
                    <span>확인</span>
                  </S.ConfirmButton>
                  <S.CancelButton onClick={() => cancelEdit("time")}>
                    <span>취소</span>
                  </S.CancelButton>
                </>
              ) : (
                <S.ModifyButton onClick={() => startEdit("time")}>
                  <span>수정</span>
                </S.ModifyButton>
              )}
            </S.ButtonGroup>
          </InfoRowComponent>

          {/* 결제 계좌 */}
          <InfoRowComponent label="결제 계좌">
            {editingAccount ? (
              <>
                <S.BanckContainer>
                  <S.BankTag>{selectedBank || "은행 선택"}</S.BankTag>
                  <S.DropButton onClick={() => setIsBankDropdownOpen((prev) => !prev)}>
                    <img src={drop} alt="dropdown" />
                  </S.DropButton>
                  {isBankDropdownOpen && (
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
                        isOpen={isBankDropdownOpen}
                        setIsOpen={setIsBankDropdownOpen}
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
                  <S.ConfirmButton onClick={() => confirmEdit("account")}>
                    <span>확인</span>
                  </S.ConfirmButton>
                  <S.CancelButton onClick={() => cancelEdit("account")}>
                    <span>취소</span>
                  </S.CancelButton>
                </>
              ) : (
                <S.ModifyButton onClick={() => startEdit("account")}>
                  <span>수정</span>
                </S.ModifyButton>
              )}
            </S.ButtonGroup>
          </InfoRowComponent>

          {/* 주문 확인 비밀번호 (수정 불가) */}
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
