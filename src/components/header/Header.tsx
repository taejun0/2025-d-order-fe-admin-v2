import * as S from "./Header.styled";
import { useState, useEffect, useRef } from "react";
import bellSoundURL from "@assets/sounds/bellsound.mp3";
import { IMAGE_CONSTANTS } from "@constants/imageConstants";
import useBoothRevenue from "./hooks/useBoothRevenue";
import Bell from "./_components/Bell";
import LiveNotice from "./_components/LiveNotice";

// 알림 타입 정의
interface Notification {
  id: number;
  message: string;
  time: string;
}

const Header = () => {
  const [isReloading, setIsReloading] = useState(false);
  const { boothName, totalRevenues, error } = useBoothRevenue();

  // 웹소켓 관련 상태
  const [liveNotice, setLiveNotice] = useState<string | null>(null);
  const [showLiveNotice, setShowLiveNotice] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // 알림 모달 관련 상태
  const [hasUnread, setHasUnread] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  // 오디오 재생 관련 ref
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isAudioUnlocked = useRef(false);

  // 페이지 클릭하는걸 기준으로 오디오 활성화
  useEffect(() => {
    if (typeof window !== "undefined" && !audioRef.current) {
      audioRef.current = new Audio(bellSoundURL);
      audioRef.current.load();
    }

    const unlockAudioOnFirstClick = () => {
      console.log("🖱️ 페이지 클릭 감지! 오디오 활성화를 시도합니다...");
      if (audioRef.current && !isAudioUnlocked.current) {
        audioRef.current
          .play()
          .then(() => {
            audioRef.current?.pause();
            audioRef.current!.currentTime = 0;
            isAudioUnlocked.current = true;
            console.log("✅ 🔔 오디오가 성공적으로 활성화되었습니다!");
            document.removeEventListener("click", unlockAudioOnFirstClick);
          })
          .catch((error) => {
            console.error("🔴 🔔 오디오 활성화 실패! 원인:", error);
          });
      } else if (isAudioUnlocked.current) {
        // 이미 활성화된 상태라면 이벤트 리스너 제거
        document.removeEventListener("click", unlockAudioOnFirstClick);
      }
    };

    document.addEventListener("click", unlockAudioOnFirstClick);

    return () => {
      document.removeEventListener("click", unlockAudioOnFirstClick);
    };
  }, []);

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");

    if (!accessToken) {
      console.error("🔴 [CALL] 웹소켓 연결 실패: 액세스 토큰이 없습니다.");
      return;
    }

    const wsUrl = `wss://api.test-d-order.store/ws/call/?token=${accessToken}`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => console.log("✅ [CALL] 직원 호출 웹소켓 연결 성공!");

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log("📥 [CALL] 새로운 호출 메시지 수신:", message);

        if (message.type === "CALL_STAFF") {
          if (isAudioUnlocked.current && audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play();
          } else {
            console.warn(
              "🔔 오디오가 아직 활성화되지 않아 소리 재생을 건너뜁니다. 페이지를 한 번 클릭해주세요."
            );
          }

          const noticeMessage = `${message.tableNumber}번 테이블에서 직원 호출! 메시지: "${message.message}"`;

          // 1. 실시간 팝업 알림 처리
          setLiveNotice(noticeMessage);
          setShowLiveNotice(true);
          setTimeout(() => setShowLiveNotice(false), 2000);

          // 2. 벨 모달 알림 목록에 추가
          const newNotification: Notification = {
            id: Date.now(), // 고유 ID로 현재 시간 사용
            message: noticeMessage,
            time: new Date().toLocaleTimeString("ko-KR"),
          };

          setNotifications((prev) => [newNotification, ...prev].slice(0, 10));
          setHasUnread(true); // 새로운 알림이 있으므로 안읽음 상태로 변경
        } else if (message.type === "ERROR") {
          console.error("🚫 [CALL] 서버로부터 에러 메시지 수신:", message);
        }
      } catch (error) {
        console.error("🔴 [CALL] 메시지 파싱 중 오류 발생:", error);
      }
    };

    ws.onerror = (error) => console.error("🔴 [CALL] 웹소켓 에러 발생:", error);
    ws.onclose = () => console.log("⚪️ [CALL] 웹소켓 연결이 종료되었습니다.");

    return () => {
      console.log("🧹 [CALL] 직원 호출 웹소켓 연결을 종료합니다.");
      ws.close();
    };
  }, []);

  const handleBellClick = () => {
    setModalOpen((prev) => !prev);
    if (!modalOpen) {
      setHasUnread(false);
    }
  };

  const handleReload = () => {
    if (isReloading) return;
    setIsReloading(true);
    window.location.reload();
  };

  const formatCurrency = (amount: number | undefined): string => {
    if (amount === undefined || isNaN(amount)) return "0";
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
