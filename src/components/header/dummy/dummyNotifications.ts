export interface Notification {
  id: number;
  message: string;
}

export const dummyNotifications: Notification[] = [
  { id: 1, message: "3번 테이블에서 새로운 주문이 접수되었습니다!" },
  { id: 2, message: "3번 테이블에서 직원을 호출했습니다!" },
  { id: 3, message: "5번 테이블에서 새로운 주문이 접수되었습니다!" },
  { id: 4, message: "23번 테이블에서 직원을 호출했습니다!" },
  { id: 5, message: "5번 테이블에서 직원을 호출했습니다!" },
  { id: 6, message: "10번 테이블에서 직원을 호출했습니다!" },
  { id: 7, message: "100번 테이블에서 직원을 호출했습니다!" },
];
