import * as S from "./Coupon.styled";
import { Dispatch, SetStateAction } from "react";
import { IMAGE_CONSTANTS } from "@constants/imageConstants";
import { useCouponForm } from "../hooks/useCouponForm";
interface SetCouponCardProps {
  isSoldOut: boolean;
  setIsDetail: Dispatch<SetStateAction<boolean>>;
}
export const CouponCard = ({ isSoldOut, setIsDetail }: SetCouponCardProps) => {
  const { radio } = useCouponForm();
  const handleDeleteClick = () => {
    console.log("삭제");
  };

  const handleDetail = () => {
    setIsDetail(true);
    console.log(setIsDetail);
  };

  return (
    <>
      <S.MenuCardWrapper>
        {isSoldOut && (
          <S.SoldOutOverlay>
            <S.SoldOutText>SOLD OUT</S.SoldOutText>
          </S.SoldOutOverlay>
        )}
        <S.CardContents>
          <S.CardImg>
            <S.DefaultCardImg>
              <img
                src={
                  radio.isPrice
                    ? IMAGE_CONSTANTS.COUPON_PRICE
                    : IMAGE_CONSTANTS.COUPON_RATE
                }
              />
            </S.DefaultCardImg>
            {isSoldOut && (
              <S.DeleteBtn onClick={handleDeleteClick}>
                <img src={IMAGE_CONSTANTS.VECTOR} alt="삭제" />
              </S.DeleteBtn>
            )}
          </S.CardImg>
          <S.CardInfo>
            <S.MenuEditBtn onClick={handleDetail}>
              <img src={IMAGE_CONSTANTS.MENUEDIT} alt="수정아이콘" />
              쿠폰 상세
            </S.MenuEditBtn>
            <S.CardTextInner>
              <S.CardText className="bold">할인쿠폰이름</S.CardText>
              <S.CardText>10%</S.CardText>
            </S.CardTextInner>
          </S.CardInfo>
        </S.CardContents>
      </S.MenuCardWrapper>
    </>
  );
};
