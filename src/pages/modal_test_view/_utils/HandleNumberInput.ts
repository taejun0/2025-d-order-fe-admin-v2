export const HandleNumberInput = (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value;
  // 숫자만 허용
  if (!/^\d*$/.test(value)) {
    e.target.value = value.replace(/[^\d]/g, ""); // 숫자만 남기고 나머지 제거
  }
};
