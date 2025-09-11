import * as S from "./Header.styled";
import { useState, useEffect } from "react";

import { IMAGE_CONSTANTS } from "@constants/imageConstants";
import useBoothRevenue from "./hooks/useBoothRevenue";
import Bell from "./_components/Bell";
import LiveNotice from "./_components/LiveNotice";
import { dummyNotifications } from "./dummy/dummyNotifications"; // 추가

const Header = () => {
  const [isReloading, setIsReloading] = useState(false);
  const { boothName, totalRevenues, error } = useBoothRevenue();

  const [liveNotice, setLiveNotice] = useState<string | null>(null);
  const [showLiveNotice, setShowLiveNotice] = useState(false); // LiveNotice 표시 여부 상태

  // 알림 안읽음 표시 여부
  const [hasUnread, setHasUnread] = useState(dummyNotifications.length > 0);
  // 모달 열림 여부
  const [modalOpen, setModalOpen] = useState(false);

  // --- 직원 호출 웹소켓 연결 로직 ---
  useEffect(() => {
    const accessToken = import.meta.env.VITE_TOKEN;

    if (!accessToken) {
      console.error("🔴 [CALL] 웹소켓 연결 실패: 액세스 토큰이 없습니다.");
      return;
    }

    const wsUrl = `wss://api.test-d-order.store/ws/call/?token=${accessToken}`;
    console.log("📞 [CALL] 직원 호출 웹소켓 연결 시도...", wsUrl);
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("✅ [CALL] 직원 호출 웹소켓 연결 성공!");
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log("📥 [CALL] 새로운 호출 메시지 수신:", message);

        if (message.type === "CALL_STAFF") {
          const noticeMessage = `${message.tableNumber}번 테이블에서 직원 호출! 메시지: "${message.message}"`;
          console.log(`❗️ [CALL] ${noticeMessage}`);
          setLiveNotice(noticeMessage);
          setShowLiveNotice(true); // LiveNotice 표시

          // 3초 후에 페이드아웃 시작
          setTimeout(() => {
            setShowLiveNotice(false);
          }, 2000);
        } else if (message.type === "ERROR") {
          console.error("🚫 [CALL] 서버로부터 에러 메시지 수신:", message);
        }
      } catch (error) {
        console.error("🔴 [CALL] 메시지 파싱 중 오류 발생:", error);
        console.log("원본 메시지:", event.data);
      }
    };

    ws.onerror = (error) => {
      console.error("🔴 [CALL] 웹소켓 에러 발생:", error);
    };

    ws.onclose = (event) => {
      if (event.wasClean) {
        console.log(
          `⚪️ [CALL] 웹소켓 연결이 정상적으로 종료되었습니다. (코드: ${event.code})`
        );
      } else {
        console.warn(
          `⚫️ [CALL] 웹소켓 연결이 비정상적으로 끊어졌습니다. (코드: ${event.code})`
        );
      }
    };

    return () => {
      console.log("🧹 [CALL] 직원 호출 웹소켓 연결을 종료합니다.");
      ws.close();
    };
  }, []);

  const handleBellClick = () => {
    setModalOpen((prev) => !prev);
    // 벨 아이콘을 클릭하여 모달을 열 때만 알림을 '읽음' 처리
    if (!modalOpen) {
      setHasUnread(false);
    }
  };
  const handleReload = () => {
    if (isReloading) return;
    setIsReloading(true);

    // 전체 페이지 새로고침
    window.location.reload();
  };

  // 금액을 포맷팅하는 함수
  const formatCurrency = (amount: number): string => {
    return amount.toLocaleString("ko-KR");
  };

  return (
    <S.HeaderWrapper>
      <S.BoothName>{error ? "부스 이름" : boothName}</S.BoothName>

      {liveNotice && <LiveNotice message={liveNotice} show={showLiveNotice} />}
      <S.SalesInfoWrapper>
        <S.SalesInfoText>💰 총 매출</S.SalesInfoText>
        <S.TotalSales>
          {error ? "0원" : `${formatCurrency(totalRevenues)}원`}
        </S.TotalSales>

        <Bell
          active={hasUnread}
          onClick={handleBellClick}
          modalOpen={modalOpen}
          onCloseModal={() => setModalOpen(false)}
          notifications={dummyNotifications}
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
