import * as S from "./LiveOrderPage.styled";
import MenuList from "./_components/menulist/MenuList";
import TableList from "./_components/tablelist/TableList";

import { useEffect } from "react";

const LiveOrderPage = () => {
  const accessToken = import.meta.env.VITE_TOKEN;

  useEffect(() => {
    // 1. 백엔드에서 수정한 웹소켓 URL을 정의합니다.
    const wsUrl = `wss://api.test-d-order.store/ws/orders/?token=${accessToken}`;

    // 2. WebSocket 객체를 생성하여 서버에 연결을 시도합니다.
    console.log("🚀 웹소켓 연결을 시도합니다...", wsUrl);
    const ws = new WebSocket(wsUrl);

    // 3. onopen 이벤트: 연결이 성공적으로 수립되었을 때 실행됩니다.
    ws.onopen = () => {
      console.log("✅ 웹소켓 연결 성공!");
    };

    // 4. onmessage 이벤트: 서버로부터 메시지를 수신했을 때 실행됩니다.
    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log("📥 새로운 메시지 수신:", message);

        // API 명세에 따라 메시지 타입을 확인하고 데이터를 처리할 수 있습니다.
        if (message.type === "NEW_ORDER") {
          console.log("📦 새 주문 데이터:", message.data);
        } else if (message.type === "ERROR") {
          console.error("🚫 서버로부터 에러 메시지 수신:", message);
        }
      } catch (error) {
        console.error("🔴 메시지 파싱 중 오류 발생:", error);
        console.log("원본 메시지:", event.data);
      }
    };

    // 5. onerror 이벤트: 연결 중 오류가 발생했을 때 실행됩니다.
    ws.onerror = (error) => {
      console.error("🔴 웹소켓 에러 발생:", error);
    };

    // 6. onclose 이벤트: 연결이 종료되었을 때 실행됩니다.
    ws.onclose = (event) => {
      if (event.wasClean) {
        console.log(
          `⚪️ 웹소켓 연결이 정상적으로 종료되었습니다. (코드: ${event.code})`
        );
      } else {
        // 서버 프로세스 종료 또는 네트워크 장애 등
        console.warn(
          `⚫️ 웹소켓 연결이 비정상적으로 끊어졌습니다. (코드: ${event.code})`
        );
      }
    };

    // 7. Cleanup 함수: 컴포넌트가 사라질 때(언마운트) 웹소켓 연결을 정리합니다.
    //    메모리 누수를 방지하기 위해 반드시 필요합니다.
    return () => {
      console.log("🧹 컴포넌트 언마운트. 웹소켓 연결을 종료합니다.");
      ws.close();
    };
  }, []); // 빈 배열([])을 전달하여 이펙트가 컴포넌트 마운트 시 한 번만 실행되도록 합니다.

  return (
    <S.LiveOrderPageWrapper>
      <MenuList />
      <TableList />
    </S.LiveOrderPageWrapper>
  );
};

export default LiveOrderPage;
