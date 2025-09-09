import * as S from "./CouponDetail.styled";
import { Dispatch, SetStateAction } from "react";
import { useState } from "react";
import { DetailData } from "./DetailData";
import { CouponItem } from "./CouponItem";
import qr from "@assets/icons/qr.svg";
import { DeleteModal } from "@components/DeleteModal/DeleteModal";
import { useCouponDetail } from "@pages/coupon/hooks/useCouponDetail";
import { useCouponCode } from "@pages/coupon/hooks/useCouponCode";
import { CouponService } from "@services/CouponService";
import { IMAGE_CONSTANTS } from "@constants/imageConstants";
interface Props {
  couponId: number;
  setSelectedCouponId: Dispatch<SetStateAction<number | null>>;
}
export const CouponDetail = ({ couponId, setSelectedCouponId }: Props) => {
  const [showDelete, setShowDelete] = useState(false);
  const { detail: detailData } = useCouponDetail(couponId);
  const { codes } = useCouponCode(couponId);

  const handleCancel = () => {
    setShowDelete(false);
  };

  const handleDelete = async () => {
    try {
      await CouponService.deleteCoupon(couponId);
      console.log("쿠폰 삭제 성공");
      setShowDelete(false);
      setSelectedCouponId(null);
    } catch (err) {
      console.error("쿠폰 삭제 실패:", err);
    }
  };
  return (
    <S.DetailBox>
      <S.DetailContainer>
        <S.DetailWrapper>
          <S.TitleWrapper>
            <img src={IMAGE_CONSTANTS.BACKWARD_BLACK} />
            <S.CouponDetailTitle>쿠폰 정보</S.CouponDetailTitle>
          </S.TitleWrapper>
          <div>
            <S.DataContainer>
              <DetailData
                DataTitle="쿠폰명"
                DataContent={detailData?.coupon_name}
              />
              <DetailData
                DataTitle="쿠폰 상세"
                DataContent={detailData?.coupon_description}
              />
              <DetailData
                DataTitle="할인 유형"
                DataContent={detailData?.discount_type}
              />
              <DetailData
                DataTitle="할인율"
                DataContent={detailData?.discount_value}
              />
              <DetailData
                DataTitle="수량"
                DataContent={`${detailData?.unused_count}/${detailData?.quantity}`}
              />
            </S.DataContainer>
            <S.BottomContainer>
              <S.QrContainer>
                <S.QrImg src={qr} />
                <span>쿠폰 번호 엑셀 파일 다운로드</span>
              </S.QrContainer>
            </S.BottomContainer>
          </div>
        </S.DetailWrapper>
        <S.DeleteBtn onClick={() => setShowDelete(true)}>쿠폰 삭제</S.DeleteBtn>
      </S.DetailContainer>
      <S.CouponList>
        {codes.map((c) => (
          <CouponItem key={c.code} code={c.code} isUsed={c.is_used} />
        ))}
      </S.CouponList>
      {showDelete && (
        <DeleteModal
          onCancel={handleCancel}
          onDelete={handleDelete}
          Title="정말 할인 쿠폰을 삭제하시겠어요?"
          SubText1="할인 쿠폰을 삭제하면,"
          SubText2="사용되지 않은 쿠폰은 사라져요!"
          BtnName="쿠폰 삭제"
        />
      )}
    </S.DetailBox>
  );
};
