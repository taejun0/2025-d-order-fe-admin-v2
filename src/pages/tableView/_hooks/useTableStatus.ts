// tableView/_hooks/useTableStatus.ts
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import {
  connectTableStatusWS,
  type TableStatusItem,
  type TableStatusMessage,
  type WSHandle,
} from "../_apis/getTableStatus";

const TAG = "%c[WS][useTableStatus]";
const TAG_STYLE = "background:#444;color:#fff;padding:2px 6px;border-radius:4px";
const OK = "%cOK";     const OK_STYLE = "color:#29a329;font-weight:700";
const WARN = "%cWARN"; const WARN_STYLE = "color:#ff9800;font-weight:700";
const ERR = "%cERR";   const ERR_STYLE = "color:#e53935;font-weight:700";

export type UseTableStatusState = {
  connecting: boolean;
  connected: boolean;
  error: string | null;
  expiredMap: Record<number, boolean>;
  statusMap: Record<number, Omit<TableStatusItem, "tableNumber">>;
  lastUpdate: string | null;
  refresh: () => void;
};

export function useTableStatus(): UseTableStatusState {
  const handleRef = useRef<WSHandle | null>(null);
  const [connecting, setConnecting] = useState(true);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expiredMap, setExpiredMap] = useState<Record<number, boolean>>({});
  const [statusMap, setStatusMap] = useState<Record<number, Omit<TableStatusItem, "tableNumber">>>({});
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);

  const onOpen = useCallback(() => {
    setConnecting(false);
    setConnected(true);
    setError(null);
    console.log(TAG, TAG_STYLE, OK, OK_STYLE, "소켓 OPEN");
  }, []);

  const onClose = useCallback(() => {
    setConnected(false);
    setConnecting(true);
    console.warn(TAG, TAG_STYLE, WARN, WARN_STYLE, "소켓 CLOSED");
  }, []);

  const onError = useCallback((ev: Event | Error) => {
    const msg =
      ev instanceof Error
        ? ev.message
        : (ev as any)?.message || "웹소켓 오류가 발생했습니다.";
    setError(msg);
    console.error(TAG, TAG_STYLE, ERR, ERR_STYLE, "소켓 ERROR:", msg, ev);
  }, []);

  const onMessage = useCallback((msg: TableStatusMessage) => {
    if (msg.type === "TABLE_STATUS" && Array.isArray(msg.data)) {
      const nextExpired: Record<number, boolean> = {};
      const expiredTrue: number[] = [];
      const expiredFalse: number[] = [];

      for (const t of msg.data) {
        if (typeof t.tableNumber === "number") {
          const isExpired = !!t.expired;
          nextExpired[t.tableNumber] = isExpired;

          if (isExpired) {
            expiredTrue.push(t.tableNumber);
          } else {
            expiredFalse.push(t.tableNumber);
          }
        }
      }

      setExpiredMap(nextExpired);
      setLastUpdate(new Date().toISOString());
      setError(null);

      // ✅ true/false 별로 리스트 출력
      console.log("[WS][useTableStatus] expired=true 테이블:", expiredTrue);
      console.log("[WS][useTableStatus] expired=false 테이블:", expiredFalse);
    }

    if (msg.type === "ERROR") {
      const text = msg.message ?? `서버 오류 (code: ${msg.code ?? "unknown"})`;
      setError(text);
      console.warn("[WS][useTableStatus] 서버 ERROR 메시지:", text);
    }
  }, []);

  useEffect(() => {
    try {
      handleRef.current = connectTableStatusWS({
        onOpen,
        onClose,
        onError,
        onMessage,
        autoReconnect: true,
        maxRetries: 7,
        baseDelayMs: 800,
      });
    } catch (e: any) {
      setError(e?.message ?? "웹소켓 초기화 실패");
      setConnecting(false);
      setConnected(false);
      console.error(TAG, TAG_STYLE, ERR, ERR_STYLE, "초기화 예외:", e);
    }

    return () => {
      console.log(TAG, TAG_STYLE, "cleanup: close()");
      handleRef.current?.close();
      handleRef.current = null;
    };
  }, [onOpen, onClose, onError, onMessage]);

  const refresh = useCallback(() => {
    console.log(TAG, TAG_STYLE, "수동 REFRESH 클릭");
    handleRef.current?.sendRefresh();
  }, []);

  return useMemo(
    () => ({
      connecting,
      connected,
      error,
      expiredMap,
      statusMap,
      lastUpdate,
      refresh,
    }),
    [connecting, connected, error, expiredMap, statusMap, lastUpdate, refresh]
  );
}
