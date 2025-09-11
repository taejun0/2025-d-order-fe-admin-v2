// tableView/_hooks/useTableStatus.ts
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import {
  connectTableStatusWS,
  type TableStatusItem,
  type TableStatusMessage,
  type WSHandle,
} from "../_apis/getTableStatus";

export type UseTableStatusState = {
  connecting: boolean;
  connected: boolean;
  error: string | null;
  /** 테이블번호 → expired(true=만료) */
  expiredMap: Record<number, boolean>;
  lastUpdate: string | null; // ISO
  refresh: () => void;
};

export function useTableStatus(): UseTableStatusState {
  const handleRef = useRef<WSHandle | null>(null);
  const [connecting, setConnecting] = useState(true);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expiredMap, setExpiredMap] = useState<Record<number, boolean>>({});
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);

  const onOpen = useCallback(() => {
    setConnecting(false);
    setConnected(true);
    setError(null);
  }, []);

  const onClose = useCallback(() => {
    setConnected(false);
    setConnecting(true);
  }, []);

  const onError = useCallback((ev: Event | Error) => {
    const msg =
      ev instanceof Error
        ? ev.message
        : (ev as any)?.message || "웹소켓 오류가 발생했습니다.";
    setError(msg);
  }, []);

  const onMessage = useCallback((msg: TableStatusMessage) => {
    if (msg.type === "TABLE_STATUS" && Array.isArray(msg.data)) {
      const next: Record<number, boolean> = {};
      for (const t of msg.data) {
        if (typeof t.tableNumber === "number") {
          next[t.tableNumber] = !!t.expired; // ✅ 핵심: expired만 저장
        }
      }
      setExpiredMap(next);
      setLastUpdate(new Date().toISOString());
      setError(null);
      return;
    }

    if (msg.type === "ERROR") {
      const text = msg.message ?? `서버 오류 (code: ${msg.code ?? "unknown"})`;
      setError(text);
      return;
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
    }

    return () => {
      handleRef.current?.close();
      handleRef.current = null;
    };
  }, [onOpen, onClose, onError, onMessage]);

  const refresh = useCallback(() => {
    handleRef.current?.sendRefresh();
  }, []);

  return useMemo(
    () => ({
      connecting,
      connected,
      error,
      expiredMap,
      lastUpdate,
      refresh,
    }),
    [connecting, connected, error, expiredMap, lastUpdate, refresh]
  );
}
