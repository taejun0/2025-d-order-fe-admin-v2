// useStatisticsWS.ts
import { useEffect, useRef } from 'react';
import type { DashboardData } from '../_services/dashboard.types';

type InitMsg = { type: 'INIT_STATISTICS'; data: DashboardData };
type PatchMsg = { type: 'STATISTICS_UPDATED'; data: Partial<DashboardData> };
type ErrMsg = { type: 'ERROR'; code: number; message: string };
type WsMsg = InitMsg | PatchMsg | ErrMsg;

export function useStatisticsWS({
  onInit,
  onPatch,
  onError,
}: {
  onInit: (full: DashboardData) => void;
  onPatch: (patch: Partial<DashboardData>) => void;
  onError?: (code: number, message: string) => void;
}) {
  const wsRef = useRef<WebSocket | null>(null);
  const closedByUser = useRef(false);
  const retry = useRef(0);
  const reconnectTimer = useRef<number | null>(null);
  const heartbeatTimer = useRef<number | null>(null);

  // 최신 콜백을 ref에 저장 (의존성 없이 사용하기 위함)
  const onInitRef = useRef(onInit);
  const onPatchRef = useRef(onPatch);
  const onErrorRef = useRef(onError);
  onInitRef.current = onInit;
  onPatchRef.current = onPatch;
  onErrorRef.current = onError;

  // 안전한 타이머 클리너
  const clearTimers = () => {
    if (reconnectTimer.current) {
      window.clearTimeout(reconnectTimer.current);
      reconnectTimer.current = null;
    }
    if (heartbeatTimer.current) {
      window.clearInterval(heartbeatTimer.current);
      heartbeatTimer.current = null;
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('accessToken') ?? '';
    if (!token) return;

    const base = (import.meta.env.VITE_WS_URL || '').replace(/\/$/, '');
    if (!base) return;
    const wsUrl = `${base}/ws/statistics/?token=${encodeURIComponent(token)}`;

    const connect = () => {
      // 이미 연결 중/완료면 추가 시도 금지
      if (
        wsRef.current &&
        (wsRef.current.readyState === WebSocket.OPEN ||
          wsRef.current.readyState === WebSocket.CONNECTING)
      ) {
        return;
      }

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        retry.current = 0; // 성공하면 백오프 초기화
        clearTimers(); // 혹시 남아있던 재시도 타이머 제거
        // 서버가 idle close 하지 않도록 heartbeat (필요 시)
        heartbeatTimer.current = window.setInterval(() => {
          // 연결 살아있을 때만 전송
          if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current!.send(JSON.stringify({ type: 'PING' }));
          }
        }, 25000);
      };

      ws.onmessage = (ev) => {
        try {
          const msg: WsMsg = JSON.parse(ev.data);
          if (msg.type === 'INIT_STATISTICS') onInitRef.current?.(msg.data);
          else if (msg.type === 'STATISTICS_UPDATED')
            onPatchRef.current?.(msg.data);
          else if (msg.type === 'ERROR')
            onErrorRef.current?.(msg.code, msg.message);
        } catch {
          // noop
        }
      };

      // onerror에서 바로 close() 하지 말자 — 일부 브라우저는 에러 후에도 OPEN 가능
      ws.onerror = (e) => {
        console.warn('WS error', e);
      };

      ws.onclose = () => {
        clearTimers();
        if (closedByUser.current) return; // 언마운트 등 사용자 종료면 끝
        // 정상종료(1000)도 여기서 재시도하고 싶지 않으면 return;
        const delay =
          Math.min(30000, 1000 * 2 ** retry.current) + Math.random() * 500;
        retry.current += 1;
        reconnectTimer.current = window.setTimeout(connect, delay);
      };
    };

    connect();

    const onVisible = () => {
      // 가끔 탭 복귀 시 누락 대비
      if (
        document.visibilityState === 'visible' &&
        wsRef.current?.readyState === WebSocket.OPEN
      ) {
        wsRef.current?.send(JSON.stringify({ type: 'REFRESH' }));
      }
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      closedByUser.current = true;
      document.removeEventListener('visibilitychange', onVisible);
      clearTimers();
      if (
        wsRef.current &&
        (wsRef.current.readyState === WebSocket.OPEN ||
          wsRef.current.readyState === WebSocket.CONNECTING)
      ) {
        wsRef.current.close(1000, 'unmount');
      }
      wsRef.current = null;
    };
    // ⛔ 의존성 비움: 리렌더/콜백 변경에도 새 연결 시도 안 함
    // 콜백 최신화는 위에서 ref로 처리
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
