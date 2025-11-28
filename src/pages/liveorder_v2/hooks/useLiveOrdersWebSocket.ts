// src/pages/liveorder_v2/hooks/useLiveOrdersWebSocket.ts

import { useEffect } from "react";
import { useLiveOrderStore } from "../LiveOrderStore";

// 목업 모드 활성화 (항상 목업 모드로 동작)
const USE_MOCK = true;

export const useLiveOrdersWebSocket = (accessToken: string | null) => {
  // 스토어에서 웹소켓 제어 함수들을 가져옴
  const { initializeWebSocket, disconnectWebSocket } = useLiveOrderStore();

  useEffect(() => {
    // ========== 목업 모드 (항상 목업 데이터만 사용) ==========
    if (USE_MOCK) {
      // 목업 모드에서는 accessToken 없이도 동작
      initializeWebSocket(accessToken || 'mock-token');
      return () => {
        disconnectWebSocket();
      };
    }
    // ========== 실제 웹소켓 연결 (주석 처리) ==========
    // if (accessToken) {
    //   // accessToken이 있으면 웹소켓 연결 초기화
    //   initializeWebSocket(accessToken);
    // }
    // // 컴포넌트가 언마운트될 때 웹소켓 연결 해제
    // return () => {
    //   disconnectWebSocket();
    // };
    
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
