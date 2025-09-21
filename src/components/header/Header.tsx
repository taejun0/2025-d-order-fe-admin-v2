import * as S from "./Header.styled";
import { useState } from "react";

import { IMAGE_CONSTANTS } from "@constants/imageConstants";
import Bell from "./_components/Bell";
import LiveNotice from "./_components/LiveNotice";

import useBoothRevenue from "./hooks/useBoothRevenue";
import useAnimatedNumber from "./hooks/useAnimatedNumber";
import { useStaffCall } from "./hooks/useStaffCall";
const Header = () => {
  const [isReloading, setIsReloading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const { boothName, totalRevenues } = useBoothRevenue();
  const { liveNotice, showLiveNotice, notifications, hasUnread, markAsRead } =
    useStaffCall();

  const animatedRevenues = useAnimatedNumber(totalRevenues);

  const handleBellClick = () => {
    setModalOpen((prev) => !prev);
    if (!modalOpen) {
      markAsRead();
    }
  };

  const handleReload = () => {
    if (isReloading) return;
    setIsReloading(true);
    window.location.reload();
  };

  const formatCurrency = (amount: number): string => {
    return amount.toLocaleString("ko-KR");
  };

  return (
    <S.HeaderWrapper>
      <S.BoothName>{boothName || "부스 이름"}</S.BoothName>

      {liveNotice && <LiveNotice message={liveNotice} show={showLiveNotice} />}
      <S.SalesInfoWrapper>
        <S.SalesInfoText>💰 총 매출</S.SalesInfoText>
        <S.TotalSales>{`${formatCurrency(animatedRevenues)}원`}</S.TotalSales>

        <Bell
          active={hasUnread}
          onClick={handleBellClick}
          modalOpen={modalOpen}
          onCloseModal={() => setModalOpen(false)}
          notifications={notifications}
        />

        <S.ReloadButton onClick={handleReload} disabled={isReloading}>
          <S.ReloadIcon
            src={IMAGE_CONSTANTS.RELOAD}
            alt="새로고침아이콘"
            className={isReloading ? "rotating" : ""}
          />
        </S.ReloadButton>
      </S.SalesInfoWrapper>
    </S.HeaderWrapper>
  );
};

export default Header;
