// tableView/_apis/getTableStatus.ts

export type TableStatusItem = {
  tableNumber: number;
  status: "activate" | "out" | string;
  activatedAt: string | null;
  remainingMinutes: number | null;
  expired: boolean;
};

export type TableStatusMessage =
  | { type: "TABLE_STATUS"; data: TableStatusItem[] }
  | { type: "ERROR"; code?: number; message?: string }
  | { type: string; [k: string]: any };

export type ConnectOptions = {
  token?: string;
  url?: string; // 기본: 명세서의 정확한 형태(/로 끝남)
  autoReconnect?: boolean;
  maxRetries?: number;
  baseDelayMs?: number;
  onOpen?: () => void;
  onClose?: (ev: CloseEvent) => void;
  onError?: (ev: Event | Error) => void;
  onMessage?: (msg: TableStatusMessage) => void;
};

export type WSHandle = {
  sendRefresh: () => void;
  close: () => void;
  getSocket: () => WebSocket | null;
};

// ✅ 명세서 그대로: 끝에 반드시 '/' 가 있는 형태
const DEFAULT_URL = "wss://api.test-d-order.store/ws/dashboard/";

// ✅ baseUrl(끝에 / 보장) + ?token= 붙이기 (중복 슬래시/물음표 방지)
function buildUrlWithToken(baseUrl: string, token: string) {
  const stripped = baseUrl.replace(/\?+.*/, "");            // ?이하 제거
  const withSlash = stripped.endsWith("/") ? stripped : stripped + "/";
  return `${withSlash}?token=${encodeURIComponent(token)}`;  // 명세: .../ ?token=...
}

export function connectTableStatusWS(opts: ConnectOptions = {}): WSHandle {
  const {
    token = localStorage.getItem("accessToken") ?? "",
    url = DEFAULT_URL,
    autoReconnect = true,
    maxRetries = 5,
    baseDelayMs = 1000,
    onOpen,
    onClose,
    onError,
    onMessage,
  } = opts;

  if (!token) {
    const err = new Error("인증 토큰(accessToken)이 없습니다.");
    onError?.(err);
    throw err;
  }

  let ws: WebSocket | null = null;
  let retries = 0;
  let manuallyClosed = false;

  const withToken = buildUrlWithToken(url, token);

  const connect = () => {
    try {
      ws = new WebSocket(withToken);
    } catch (e) {
      onError?.(e as Error);
      return;
    }

    ws.onopen = () => {
      retries = 0;
      onOpen?.();
      try {
        ws?.send(JSON.stringify({ type: "REFRESH" }));
      } catch (e) {
        onError?.(e as Error);
      }
    };
    ws.onopen = () => {
    retries = 0;
    onOpen?.();
    console.log("[WS] 연결 성공 🎉");

    try {
        ws?.send(JSON.stringify({ type: "REFRESH" }));
    } catch (e) {
        onError?.(e as Error);
    }
    };
    ws.onmessage = (ev: MessageEvent) => {
      try {
        const parsed: TableStatusMessage = JSON.parse(ev.data);
        onMessage?.(parsed);
      } catch (e) {
        onError?.(e as Error);
      }
    };

    ws.onerror = (ev: Event) => {
      onError?.(ev);
    };

    ws.onclose = (ev: CloseEvent) => {
      onClose?.(ev);

      // 수동 종료면 조용히 종료
      if (manuallyClosed) return;

      // 자동 재연결
      if (autoReconnect && retries < maxRetries) {
        const delay = baseDelayMs * Math.pow(2, retries);
        retries += 1;
        setTimeout(connect, delay);
      }
    };
  };

  connect();

  const sendRefresh = () => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: "REFRESH" }));
    }
  };

  const close = () => {
    manuallyClosed = true;
    if (!ws) return;

    try {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close(1000, "client-close");
      } else if (ws.readyState === WebSocket.CONNECTING) {
        // StrictMode 초기 언마운트에서 뜨는 경고 방지:
        const toClose = ws;
        toClose.onopen = () => {
          try { toClose.close(1000, "client-close"); } catch {}
        };
        // 즉시 close() 호출하지 않음
      }
    } catch {}
    ws = null;
  };

  const getSocket = () => ws;

  return { sendRefresh, close, getSocket };
}
