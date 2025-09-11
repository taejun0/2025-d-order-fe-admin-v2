import * as S from "./CouponDetail.styled";
interface SetCouponDetailProps {
  DataTitle?: string;
  DataContent?: string | number;
}
export const DetailData = ({
  DataTitle,
  DataContent,
}: SetCouponDetailProps) => {
  return (
    <S.DataBlock>
      <S.DataTitle>{DataTitle}</S.DataTitle>
      <S.DataContent>{DataContent}</S.DataContent>
    </S.DataBlock>
  );
};
