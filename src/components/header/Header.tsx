import * as S from "./Header.styled";
import { useState } from "react";

import { IMAGE_CONSTANTS } from "@constants/imageConstants";
import Bell from "./_components/Bell";
import LiveNotice from "./_components/LiveNotice";

// 훅 import
import useBoothRevenue from "./hooks/useBoothRevenue";
import useAnimatedNumber from "./hooks/useAnimatedNumber";
import { useStaffCall } from "./hooks/useStaffCall"; // 새로 만든 훅 import

const Header = () => {
  const [isReloading, setIsReloading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  // ✅ 1. 기능별로 커스텀 훅 호출
  const { boothName, totalRevenues, error } = useBoothRevenue();
  const { liveNotice, showLiveNotice, notifications, hasUnread, markAsRead } =
    useStaffCall();

  const animatedRevenues = useAnimatedNumber(totalRevenues);

  // ❌ 호출벨 관련 useEffect 및 상태 선언 모두 삭제

  const handleBellClick = () => {
    setModalOpen((prev) => !prev);
    if (!modalOpen) {
      // ✅ 2. 훅에서 반환된 함수 호출
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
      <S.BoothName>{!error ? boothName : "부스 이름"}</S.BoothName>

      {liveNotice && <LiveNotice message={liveNotice} show={showLiveNotice} />}
      <S.SalesInfoWrapper>
        <S.SalesInfoText>💰 총 매출</S.SalesInfoText>
        <S.TotalSales>
          {!error ? `${formatCurrency(animatedRevenues)}원` : "0원"}
        </S.TotalSales>

        {/* ✅ 3. 훅에서 받아온 상태들을 props로 전달 */}
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
