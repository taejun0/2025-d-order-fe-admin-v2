// src/pages/liveorder_v2/hooks/useLiveOrdersWebSocket.ts

import { useEffect } from "react";
import { useLiveOrderStore } from "../LiveOrderStore";

export const useLiveOrdersWebSocket = (accessToken: string | null) => {
  // 스토어에서 웹소켓 제어 함수들을 가져옴
  const { initializeWebSocket, disconnectWebSocket } = useLiveOrderStore();

  useEffect(() => {
    if (accessToken) {
      // accessToken이 있으면 웹소켓 연결 초기화
      initializeWebSocket(accessToken);
    }

    // 컴포넌트가 언마운트될 때 웹소켓 연결 해제
    return () => {
      disconnectWebSocket();
    };
  }, [accessToken, initializeWebSocket, disconnectWebSocket]);
};
