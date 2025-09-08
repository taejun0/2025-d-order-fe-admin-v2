import CouponCreateCard from "./_components/CouponCreateCard";
import * as S from "./CouponPage.styled";

const CouponPage = () => {
  return (
    <S.CouponPageWrapper>
      <S.CouponGrid>
        <CouponCreateCard />
      </S.CouponGrid>
    </S.CouponPageWrapper>
  );
};

export default CouponPage;
