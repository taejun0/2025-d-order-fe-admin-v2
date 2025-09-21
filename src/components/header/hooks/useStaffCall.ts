import { useState, useEffect } from "react";
import { AxiosError } from "axios";
import { instance } from "@services/instance";
import { BellPlayer } from "../BellPlayer";

interface Notification {
  id: number;
  message: string;
  time: string;
}

interface ApiCallStaff {
  tableNumber: number;
  createdAt: string;
}

export const useStaffCall = () => {
  const [liveNotice, setLiveNotice] = useState<string | null>(null);
  const [showLiveNotice, setShowLiveNotice] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    BellPlayer.ensureUnlocked();

    const fetchInitialNotifications = async () => {
      try {
        const response = await instance.get<{
          status: string;
          data: ApiCallStaff[];
        }>("/api/v2/booth/staff-calls/");

        const fetchedNotifications: Notification[] = response.data.data.map(
          (item) => ({
            id: new Date(item.createdAt).getTime(),
            message: `${item.tableNumber}번 테이블에서 직원을 호출했습니다.`,
            time: new Date(item.createdAt).toLocaleTimeString("ko-KR"),
          })
        );

        setNotifications(fetchedNotifications.slice(0, 7));
        console.log("✅ [GET] 초기 알림 기록을 성공적으로 가져왔습니다.");
      } catch (e) {
        const error = e as AxiosError;
        console.error("🔴 [GET] 초기 알림 기록 로딩 중 오류:", error.message);
      }
    };

    fetchInitialNotifications();
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
        if (message.type === "CALL_STAFF") {
          const noticeMessage = message.message;

          BellPlayer.play();

          setLiveNotice(noticeMessage);
          setShowLiveNotice(true);
          setTimeout(() => setShowLiveNotice(false), 4000);

          const newNotification: Notification = {
            id: Date.now(),
            message: noticeMessage,
            time: new Date().toLocaleTimeString("ko-KR"),
          };

          setNotifications((prev) => [newNotification, ...prev].slice(0, 10));
          setHasUnread(true);
        }
      } catch (error) {
        console.error("🔴 [CALL] 메시지 처리 중 오류 발생:", error);
      }
    };

    ws.onerror = (error) => console.error("🔴 [CALL] 웹소켓 에러 발생:", error);
    ws.onclose = () => console.log("⚪️ [CALL] 웹소켓 연결이 종료되었습니다.");

    return () => {
      ws.close();
    };
  }, []);

  const markAsRead = () => {
    setHasUnread(false);
  };

  return {
    liveNotice,
    showLiveNotice,
    notifications,
    hasUnread,
    markAsRead,
  };
};
