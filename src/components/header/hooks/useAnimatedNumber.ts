// src/hooks/useAnimatedNumber.ts (새로운 경로에 파일 생성)

import { useState, useEffect, useRef } from "react";

const useAnimatedNumber = (
  targetValue: number,
  duration: number = 500 // 애니메이션 지속 시간 (ms)
) => {
  const [currentValue, setCurrentValue] = useState(targetValue);
  const frameRef = useRef<number | null>(null);
  const prevValueRef = useRef(targetValue);

  useEffect(() => {
    const startValue = prevValueRef.current;
    const endValue = targetValue;
    let startTime: number | null = null;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);

      const animatedValue = startValue + (endValue - startValue) * percentage;
      setCurrentValue(Math.round(animatedValue));

      if (progress < duration) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        // 애니메이션 종료 후 정확한 값으로 설정
        setCurrentValue(endValue);
        prevValueRef.current = endValue;
      }
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [targetValue, duration]);

  return currentValue;
};

export default useAnimatedNumber;
