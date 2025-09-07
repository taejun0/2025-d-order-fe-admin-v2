// src/hooks/useCurrentTime.ts

import { useState, useEffect } from "react";

/**
 * 지정된 간격(interval)마다 현재 시간을 업데이트하여 반환하는 커스텀 훅
 * @param intervalMs - 시간을 업데이트할 간격 (밀리초 단위)
 * @returns 현재 시간의 타임스탬프 (number)
 */
export const useCurrentTime = (intervalMs: number) => {
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    // 지정된 간격마다 currentTime 상태를 갱신
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, intervalMs);

    // 컴포넌트가 언마운트될 때 인터벌 정리
    return () => clearInterval(interval);
  }, [intervalMs]); // intervalMs가 변경될 경우에만 타이머를 재설정

  return currentTime;
};
