import * as S from "./Coupon.styled";
import { IMAGE_CONSTANTS } from "@constants/imageConstants";
import { Coupon } from "@services/CouponService";

interface SetCouponCardProps {
  coupondata: Coupon;
  onDetail: () => void;
}
export const CouponCard = ({ coupondata, onDetail }: SetCouponCardProps) => {
  const handleDeleteClick = () => {
    console.log("삭제");
  };
  return (
    <>
      <S.MenuCardWrapper>
        {coupondata.remaining_count === 0 && (
          <S.SoldOutOverlay>
            <S.SoldOutText>SOLD OUT</S.SoldOutText>
          </S.SoldOutOverlay>
        )}
        <S.CardContents>
          <S.CardImg>
            <S.DefaultCardImg>
              <img
                src={
                  coupondata.discount_type === "amount"
                    ? IMAGE_CONSTANTS.COUPON_PRICE
                    : IMAGE_CONSTANTS.COUPON_RATE
                }
              />
            </S.DefaultCardImg>
            {coupondata.is_used && (
              <S.DeleteBtn onClick={handleDeleteClick}>
                <img src={IMAGE_CONSTANTS.VECTOR} alt="삭제" />
              </S.DeleteBtn>
            )}
          </S.CardImg>
          <S.CardInfo>
            <S.MenuEditBtn onClick={onDetail}>
              <img src={IMAGE_CONSTANTS.MENUEDIT} alt="수정아이콘" />
              쿠폰 상세
            </S.MenuEditBtn>
            <S.CardTextInner>
              <S.CardText
                className={`bold name ${
                  coupondata.coupon_name.length >= 8 ? "wrap" : ""
                }`}
              >
                {coupondata.coupon_name}
              </S.CardText>
              <S.CardText className="price">
                {coupondata.discount_value}
                {coupondata.discount_type === "amount" ? (
                  <span>원</span>
                ) : (
                  <span>%</span>
                )}
              </S.CardText>
            </S.CardTextInner>
          </S.CardInfo>
        </S.CardContents>
      </S.MenuCardWrapper>
    </>
  );
};
