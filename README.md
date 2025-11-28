# 🎉 D-Order Admin v2

> 동국대학교 축제 주점 운영을 위한 관리자 대시보드입니다! 🍺

---

## ✨ 프로젝트 소개

동국대 축제 주점에서 사용하는 **실시간 주문 관리 시스템**입니다.

- 📱 손님들이 주문하면 → 실시간으로 주방/서빙 화면에 표시
- 🍕 메뉴 관리, 테이블 관리, 쿠폰 발급까지
- 📊 매출 통계와 인기 메뉴까지 한눈에!

---

## 🛠️ 기술 스택

| 분류                | 기술                  |
| ------------------- | --------------------- |
| **프레임워크**      | React 19 + TypeScript |
| **빌드 도구**       | Vite 6                |
| **스타일링**        | Styled Components     |
| **상태 관리**       | Zustand               |
| **라우팅**          | React Router DOM 7    |
| **HTTP 클라이언트** | Axios                 |

---

## 🚀 시작하기

### 설치 및 실행

```bash
npm install
npm run dev
```

`https://localhost:5173`에서 바로 확인할 수 있습니다.

---

## 🎯 주요 구현 내용

### 1️⃣ 데이터 손실 문제 해결을 위한 서버 기반 장바구니 아키텍처 전환

**문제점:**

- 기존에는 `Zustand`를 사용한 클라이언트 전역 상태 관리로 장바구니를 관리
- 페이지 새로고침, 여러 탭 사용, 로그인/로그아웃 시 장바구니 데이터 손실 발생

**해결 방안:**

- **서버 기반 아키텍처로 전환**: 서버를 "Source of Truth"로 설정하고, 클라이언트는 캐싱과 표시만 담당
- **`cart_id` 관리**: `localStorage`에 `cart_id`를 저장하고 이후 요청에 함께 전송하여 세션/탭 간 동일한 장바구니 유지
- **React Query 도입**: API 데이터 캐싱 및 무효화 전략 구현
  - 장바구니 수정 시 자동 캐시 무효화
  - 메뉴, 장바구니, 주문 확인 페이지 간 서버-클라이언트 데이터 동기화

**구현 위치:**

- `src/services/` - API 서비스 레이어
- React Query를 통한 데이터 페칭 및 캐싱

---

### 2️⃣ 실시간 운영 의사결정을 위한 WebSocket 기반 Dashboard 구축

**목적:**
운영진이 실시간 매출 현황을 모니터링하고 누적된 주문 데이터를 기반으로 데이터 기반 의사결정을 할 수 있도록 Dashboard 설계 및 구현

**주요 구현 내용:**

#### WebSocket 실시간 통계 수신

- 서버로부터 실시간 통계 변경사항을 WebSocket으로 수신
- 메시지 타입별 처리 로직 구현:
  - `INIT_STATISTICS`: 초기 통계 데이터 전체 로드
  - `STATISTICS_UPDATED`: 부분 업데이트 데이터 병합
  - `ERROR`: 에러 처리

**구현 위치:**

- `src/pages/dashboard/_hooks/useStatisticsWS.ts`

```typescript
// WebSocket 메시지 타입별 처리
if (msg?.type === TYPE_INIT) {
  onInit(msg.data); // 전체 데이터 교체
} else if (msg?.type === TYPE_PATCH) {
  onPatch(msg.data); // 부분 업데이트 병합
}
```

#### TypeScript 타입 변환 레이어

- 서버 응답의 `snake_case`를 프론트엔드 `camelCase`로 변환
- `mapDashboardResponse`: 초기 로드 시 전체 데이터 변환
- `mapDashboardPatch`: 부분 업데이트 데이터 변환

**구현 위치:**

- `src/pages/dashboard/_services/dashboard.mapper.ts`

```typescript
// 서버 응답 변환 예시
export function mapDashboardResponse(res: DashboardResponse): DashboardData {
  return {
    kpi: {
      totalOrders: d.total_orders ?? 0,
      recentOrders: d.recent_orders ?? 0,
      // ...
    },
    top3: (d.top3_menus ?? []).map((m: any) => ({
      name: m?.menu__menu_name ?? '',
      imageUrl: withImageBase(m.menu__menu_image) || '/images/Pizza.png',
      // ...
    })),
  };
}
```

#### 성능 최적화: `mergeDashboard` 함수

- 초기 로드 시 전체 데이터 교체
- 이후 업데이트는 `mergeDashboard` 함수로 부분 병합
- 변경되지 않은 필드의 불필요한 리렌더링 방지

**구현 위치:**

- `src/pages/dashboard/_services/dashboard.mapper.ts`

```typescript
export function mergeDashboard(
  prev: DashboardData | undefined,
  patch: Partial<DashboardData>
): DashboardData {
  return {
    ...prev,
    kpi: { ...prev.kpi, ...patch.kpi },
    top3: 'top3' in patch ? patch.top3 ?? [] : prev.top3,
    // 변경된 필드만 업데이트
  };
}
```

#### Dashboard 표시 항목

- 일일 매출 현황
- 인기 메뉴 TOP 3
- 재고 부족 메뉴
- 평균 대기 시간
- 기타 축제 운영에 중요한 실시간 지표

**구현 위치:**

- `src/pages/dashboard/DashboardPage.tsx`
- `src/pages/dashboard/_components/`

---

### 3️⃣ 축제 현장 환경을 고려한 JWT 자동 인증 시스템 구축

**목적:**
축제 현장에서 장시간 근무하는 운영진을 위한 원활한 인증 경험 제공

**주요 구현 내용:**

#### Axios 요청 인터셉터: 자동 토큰 추가

- 모든 API 요청에 `localStorage`의 `accessToken`을 자동으로 `Authorization` 헤더에 추가
- 로그인 없이도 자동 인증 가능

**구현 위치:**

- `src/services/instance.ts`

```typescript
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token && !config.url?.includes('/api/v2/manager/auth/')) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});
```

#### Axios 응답 인터셉터: 자동 토큰 갱신

- 401 에러 발생 시 쿠키의 `Refresh Token`을 사용하여 자동으로 새로운 `Access Token` 발급 및 저장
- 인증 세션 유지

**구현 위치:**

- `src/services/instance.ts`

```typescript
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Refresh Token으로 새 Access Token 발급
      const res = await instance.get('/api/v2/manager/auth/');
      const newAccessToken = res.data?.data?.access;
      setAccessToken(newAccessToken);
      // 원본 요청 재시도
      return instance(originalRequest);
    }
  }
);
```

#### `failedQueue` 패턴: 중복 토큰 갱신 방지

- 동시에 여러 요청이 401 에러를 받을 때, 첫 번째 요청만 토큰 갱신을 수행
- 나머지 요청은 대기 후 새 토큰으로 재시도
- 중복 토큰 갱신 요청 방지로 서버 부하 감소

**구현 위치:**

- `src/services/instance.ts`

```typescript
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: any) => void;
}> = [];

if (error.response?.status === 401 && !originalRequest._retry) {
  if (isRefreshing) {
    // 이미 갱신 중이면 큐에 추가
    return new Promise((resolve, reject) => {
      failedQueue.push({
        resolve: (token: string) => {
          originalRequest.headers['Authorization'] = `Bearer ${token}`;
          resolve(instance(originalRequest));
        },
        reject,
      });
    });
  } else {
    // 첫 번째 요청만 토큰 갱신 수행
    isRefreshing = true;
    // ... 토큰 갱신 로직
    processQueue(newAccessToken, null); // 대기 중인 요청들 처리
  }
}
```

#### `useAuthRedirect` 커스텀 훅: 자동 리다이렉트

- `localStorage`에 `accessToken`이 없으면 자동으로 초기화 페이지로 리다이렉트
- 보안 강화

**구현 위치:**

- `src/hooks/useAuthRedirect.ts`

```typescript
const useAuthRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      navigate(ROUTE_PATHS.INIT);
    }
  }, [navigate]);
};
```

---

## 📁 프로젝트 구조

```
src/
├── pages/
│   ├── dashboard/          # WebSocket 기반 실시간 대시보드
│   │   ├── _hooks/
│   │   │   └── useStatisticsWS.ts  # WebSocket 통계 수신 훅
│   │   ├── _services/
│   │   │   ├── dashboard.mapper.ts  # 타입 변환 및 병합 로직
│   │   │   └── dashboard.types.ts
│   │   └── _components/    # 대시보드 컴포넌트들
│   ├── liveorder_v2/       # 실시간 주문 관리
│   ├── tableView/          # 테이블 관리
│   ├── menu/               # 메뉴 관리
│   ├── coupon/             # 쿠폰 관리
│   └── mypage/             # 마이페이지
├── services/
│   └── instance.ts         # Axios 인스턴스 및 JWT 자동 인증
├── hooks/                  # 커스텀 훅
│   └── useAuthRedirect.ts  # 인증 리다이렉트 훅
├── components/             # 공통 컴포넌트
└── constants/               # 상수 정의
```

---

## 📱 주요 페이지

### 🏠 대시보드 (`/dashboard`)

WebSocket 기반 실시간 통계 대시보드

**기능:**

- 📊 총 주문 수, 방문자 수 실시간 확인
- 🏆 인기 메뉴 TOP 3
- ⚠️ 재고 부족 메뉴 알림
- 💰 실시간 매출 통계
- ⏱️ 평균 대기 시간 및 테이블 사용률

**기술적 특징:**

- WebSocket으로 실시간 업데이트
- 초기 로드 시 전체 데이터, 이후 부분 업데이트만 병합
- TypeScript 타입 안정성 보장

**인증:**

- `useAuthRedirect` 훅으로 인증되지 않은 사용자 자동 리다이렉트
- `UserLayout` 컴포넌트에서 인증 체크

**사용 커스텀 훅:**

- `useDashboard`: 대시보드 데이터 로딩 및 상태 관리
- `useStatisticsWS`: WebSocket 통계 수신 및 메시지 처리

**화면 미리보기:**

![대시보드 실시간 업데이트](./docs/gifs/dashboard-realtime.gif)

---

### 🍕 실시간 주문 (`/home`)

**기능:**

- 📥 주문이 들어오면 실시간으로 화면에 표시
- 👨‍🍳 주방 모드 / 서빙 모드 전환 가능
- 🔄 주문 상태 변경: 대기 → 조리 중 → 서빙 완료
- 📋 메뉴별 필터링으로 주문 확인
- 🔔 WebSocket으로 실시간 업데이트

**인증:**

- `useAuthRedirect` 훅으로 인증 체크
- `UserLayout`에서 인증되지 않은 사용자 차단

**사용 커스텀 훅:**

- `useLiveOrdersWebSocket`: WebSocket 연결 및 주문 데이터 수신
- `useMenuData`: 메뉴 목록 데이터 관리
- `useGroupedAndSortedOrders`: 주문 그룹화 및 정렬 로직

**화면 미리보기:**

![실시간 주문 처리](./docs/gifs/liveorder-realtime.gif)

---

### 🪑 테이블 관리 (`/table-view`)

**기능:**

- 📋 테이블 목록 조회 (활성/비활성 상태 표시)
- 🔍 테이블별 상세 주문 내역 확인
- 🔄 테이블 리셋 기능
- ✏️ 주문 수량 변경 및 취소
- 💰 테이블별 총 금액 확인

**인증:**

- `useAuthRedirect` 훅으로 인증 체크
- 모든 테이블 조작은 인증된 사용자만 가능

**화면 미리보기:**

![테이블 관리](./docs/gifs/table-management.gif)

---

### 🍔 메뉴 관리 (`/menu`)

**기능:**

- ➕ 메뉴 추가/수정/삭제
- 🖼️ 메뉴 이미지 업로드
- 📦 재고 수량 관리
- 🏷️ 메뉴 카테고리 설정
- 🍱 세트메뉴 구성 및 관리
- ⚠️ 품절 처리

**인증:**

- `useAuthRedirect` 훅으로 인증 체크
- 메뉴 수정/삭제는 인증된 관리자만 가능

**화면 미리보기:**

![메뉴 관리](./docs/gifs/menu-management.gif)

---

### 🎫 쿠폰 관리 (`/coupon`)

**기능:**

- ➕ 쿠폰 생성 (할인율/할인금액)
- 🎟️ 쿠폰 코드 발급
- 📊 쿠폰 사용 내역 확인
- 📥 엑셀 다운로드
- 📈 쿠폰별 통계 확인

**인증:**

- `useAuthRedirect` 훅으로 인증 체크
- 쿠폰 생성 및 관리는 인증된 사용자만 가능

**사용 커스텀 훅:**

- `useCouponList`: 쿠폰 목록 조회
- `useCouponDetail`: 쿠폰 상세 정보 조회
- `useCreateCoupon`: 쿠폰 생성 로직
- `useCouponForm`: 쿠폰 폼 상태 관리
- `useCouponCode`: 쿠폰 코드 관리

**화면 미리보기:**

![쿠폰 관리](./docs/gifs/coupon-management.gif)

---

### 👤 마이페이지 (`/mypage`)

**기능:**

- 🏪 부스 정보 수정
- 🪑 테이블 수 확인
- 💳 계좌 정보 관리
- 💰 좌석 과금 설정 (인원당/테이블당)
- ⏰ 이용 시간 제한 설정
- 📱 QR 코드 다운로드
- 🚪 로그아웃

**인증:**

- `useAuthRedirect` 훅으로 인증 체크
- 본인 정보만 수정 가능

**사용 커스텀 훅:**

- `useManagers`: 운영자 정보 조회 및 상태 관리
- `useManagerPatch`: 운영자 정보 수정 로직

**화면 미리보기:**

![마이페이지](./docs/gifs/mypage.gif)

---

### 🔐 로그인 (`/login`)

**기능:**

- 🔑 ID/비밀번호 로그인
- 🎫 로그인 성공 시 `accessToken` 저장
- 🔄 자동 인증 시스템과 연동

**인증 플로우:**

1. 사용자 로그인 정보 입력
2. `UserService.login()` 호출
3. 성공 시 `accessToken`을 `localStorage`에 저장
4. `/home`으로 자동 리다이렉트
5. 이후 모든 API 요청에 자동으로 토큰 포함

**화면 미리보기:**

![로그인](./docs/gifs/login.gif)

---

## 🎣 사용한 커스텀 훅

### 인증 관련

- **`useAuthRedirect`**: 인증되지 않은 사용자를 자동으로 초기화 페이지로 리다이렉트
  - 위치: `src/hooks/useAuthRedirect.ts`
  - 사용: `UserLayout`, `DefaultLayout` 컴포넌트

### 대시보드 관련

- **`useDashboard`**: 대시보드 데이터 로딩 및 상태 관리

  - 위치: `src/pages/dashboard/_hooks/useDashboard.ts`
  - 기능: 초기 데이터 로드, 폴링 옵션, 에러 처리

- **`useStatisticsWS`**: WebSocket 통계 수신 및 메시지 처리
  - 위치: `src/pages/dashboard/_hooks/useStatisticsWS.ts`
  - 기능: WebSocket 연결, 메시지 타입별 처리 (INIT_STATISTICS, STATISTICS_UPDATED, ERROR)

### 실시간 주문 관련

- **`useLiveOrdersWebSocket`**: WebSocket 연결 및 주문 데이터 수신

  - 위치: `src/pages/liveorder_v2/hooks/useLiveOrdersWebSocket.ts`
  - 기능: WebSocket 연결 관리, 주문 데이터 실시간 수신

- **`useMenuData`**: 메뉴 목록 데이터 관리

  - 위치: `src/pages/liveorder_v2/hooks/useMenuData.ts`

- **`useGroupedAndSortedOrders`**: 주문 그룹화 및 정렬 로직
  - 위치: `src/pages/liveorder_v2/hooks/useGroupedAndSortedOrders.ts`
  - 기능: 주문을 메뉴별/상태별로 그룹화 및 정렬

### 마이페이지 관련

- **`useManagers`**: 운영자 정보 조회 및 상태 관리

  - 위치: `src/pages/mypage/hooks/useManagers.ts`
  - 기능: 운영자 정보 조회, 수정, 자동 로드 옵션

- **`useManagerPatch`**: 운영자 정보 수정 로직
  - 위치: `src/pages/mypage/hooks/useManagerPatch.ts`
  - 기능: 부분 업데이트, 좌석 필드 정규화

### 쿠폰 관련

- **`useCouponList`**: 쿠폰 목록 조회

  - 위치: `src/pages/coupon/hooks/useCouponList.tsx`

- **`useCouponDetail`**: 쿠폰 상세 정보 조회

  - 위치: `src/pages/coupon/hooks/useCouponDetail.tsx`

- **`useCreateCoupon`**: 쿠폰 생성 로직

  - 위치: `src/pages/coupon/hooks/useCreateCoupon.tsx`

- **`useCouponForm`**: 쿠폰 폼 상태 관리

  - 위치: `src/pages/coupon/hooks/useCouponForm.tsx`

- **`useCouponCode`**: 쿠폰 코드 관리
  - 위치: `src/pages/coupon/hooks/useCouponCode.tsx`

### 기타

- **`useOrderData`**: 주문 데이터 관리

  - 위치: `src/pages/order/hooks/useOrderData.ts`

- **`useStaffCall`**: 스태프 호출 기능

  - 위치: `src/components/header/hooks/useStaffCall.ts`

- **`useBoothRevenue`**: 부스 매출 조회

  - 위치: `src/components/header/hooks/useBoothRevenue.ts`

- **`useAnimatedNumber`**: 숫자 애니메이션

  - 위치: `src/components/header/hooks/useAnimatedNumber.ts`

- **`useGoogleAnalytics`**: 구글 애널리틱스 연동

  - 위치: `src/hooks/useGoogleAnalytics.ts`

- **`useCalcVh`**: 뷰포트 높이 계산
  - 위치: `src/hooks/useCalcVh.ts`

---

## 🔐 인증 시스템

### JWT 자동 인증 플로우

1. **로그인**: `accessToken`과 `refreshToken` 발급
2. **자동 토큰 추가**: 모든 API 요청에 `accessToken` 자동 포함
3. **자동 토큰 갱신**: 401 에러 시 `refreshToken`으로 자동 갱신
4. **중복 요청 방지**: `failedQueue` 패턴으로 동시 요청 처리

### 보안 기능

- 토큰 만료 시 자동 로그아웃
- `useAuthRedirect` 훅으로 인증되지 않은 사용자 자동 리다이렉트
- 쿠키 기반 `refreshToken` 관리

### 인증이 필요한 페이지

모든 주요 페이지는 `UserLayout` 또는 `DefaultLayout` 컴포넌트를 통해 `useAuthRedirect` 훅을 사용하여 인증을 체크합니다:

- `/dashboard` - 대시보드
- `/home` - 실시간 주문
- `/table-view` - 테이블 관리
- `/menu` - 메뉴 관리
- `/coupon` - 쿠폰 관리
- `/mypage` - 마이페이지

인증되지 않은 사용자는 자동으로 `/` (초기화 페이지)로 리다이렉트됩니다.

---

## 📦 빌드

```bash
# 개발 모드
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 미리보기
npm run preview
```

---

## 📝 환경 변수

`.env` 파일 설정:

```bash
# 백엔드 API URL
VITE_BASE_URL=https://api.example.com

# WebSocket URL
VITE_WS_URL=wss://api.example.com
```

---

## 📸 화면 미리보기

각 페이지의 주요 기능을 GIF로 확인할 수 있습니다:

| 페이지      | GIF 파일                           | 설명                              |
| ----------- | ---------------------------------- | --------------------------------- |
| 대시보드    | `docs/gifs/dashboard-realtime.gif` | 실시간 통계 업데이트              |
| 실시간 주문 | `docs/gifs/liveorder-realtime.gif` | 주문 상태 변경 및 실시간 업데이트 |
| 테이블 관리 | `docs/gifs/table-management.gif`   | 테이블 조회 및 리셋               |
| 메뉴 관리   | `docs/gifs/menu-management.gif`    | 메뉴 CRUD 작업                    |
| 쿠폰 관리   | `docs/gifs/coupon-management.gif`  | 쿠폰 생성 및 코드 발급            |
| 마이페이지  | `docs/gifs/mypage.gif`             | 부스 정보 수정                    |
| 로그인      | `docs/gifs/login.gif`              | 로그인 플로우                     |

> 💡 **GIF 추가 방법**:
>
> 1. `docs/gifs/` 폴더에 GIF 파일 추가
> 2. 파일명은 위 표의 이름과 동일하게 설정
> 3. README의 각 페이지 섹션에 자동으로 표시됩니다

---

## 📄 라이선스

2025 동국대학교 축제 주점운영서비스 D-order 프로젝트입니다.

---

## 🤝 기여하기

버그를 찾았거나 기능을 추가하고 싶다면 언제든지 PR 보내주세요! 🎉

---

**Happy Coding!** 💻✨
