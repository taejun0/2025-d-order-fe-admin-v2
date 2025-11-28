// src/pages/liveorder_v2/services/LiveOrderService.ts
import { LiveOrderWebSocketMessage, OrderSnapshotMessage } from "../types";
import { mockOrderItems } from "../../../mocks/mockData";

// 스토어 상태를 업데이트할 콜백 함수 타입 정의
type UpdateStoreCallback = (message: LiveOrderWebSocketMessage) => void;

class LiveOrderWebSocketService {
  private updateStore: UpdateStoreCallback;
  private mockInterval: NodeJS.Timeout | null = null; // 목업용 인터벌

  constructor(_accessToken: string, updateStore: UpdateStoreCallback) {
    // 목업 모드에서는 accessToken, wsUrl, ws를 사용하지 않음
    // this.wsUrl = `wss://api.test-d-order.store/ws/orders/?token=${accessToken}`;
    this.updateStore = updateStore;
  }

  public connect() {
    // ========== 목업 모드 (항상 목업 데이터만 사용) ==========
    console.log("[MOCK] 웹소켓 연결 시뮬레이션 시작");
    
    // 초기 스냅샷 전송
    const snapshotMessage: OrderSnapshotMessage = {
      type: "ORDER_SNAPSHOT",
      data: {
        total_revenue: 1250000,
        orders: mockOrderItems,
      },
    };
    this.updateStore(snapshotMessage);

    // 주기적으로 업데이트 메시지 전송 (5초마다)
    this.mockInterval = setInterval(() => {
      const updateMessage: LiveOrderWebSocketMessage = {
        type: "ORDER_UPDATE",
        data: {
          orders: mockOrderItems.map(item => ({
            ...item,
            status: item.status === 'pending' ? 'cooked' : item.status,
          })),
        },
      };
      this.updateStore(updateMessage);
    }, 5000);

    // ========== 실제 웹소켓 연결 (주석 처리 - 목업 모드에서 사용 안 함) ==========
    // if (this.ws) {
    //   this.disconnect();
    // }
    // this.ws = new WebSocket(this.wsUrl);
    // this.ws.onmessage = (event) => {
    //   try {
    //     const message: LiveOrderWebSocketMessage = JSON.parse(event.data);
    //     this.updateStore(message);
    //   } catch (error) {
    //     console.error("🔴 메시지 파싱 중 오류 발생:", error);
    //   }
    // };
    // this.ws.onerror = (error) => {
    //   console.error("🔴 웹소켓 에러 발생:", error);
    // };
  }

  public disconnect() {
    // ========== 목업 모드 (항상 목업 데이터만 사용) ==========
    if (this.mockInterval) {
      clearInterval(this.mockInterval);
      this.mockInterval = null;
    }
    console.log("[MOCK] 웹소켓 연결 시뮬레이션 종료");
    
    // ========== 실제 웹소켓 연결 해제 (주석 처리 - 목업 모드에서 사용 안 함) ==========
    // if (this.ws) {
    //   this.ws.close();
    //   this.ws = null;
    // }
  }
}

export default LiveOrderWebSocketService;
