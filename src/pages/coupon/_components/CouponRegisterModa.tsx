import { IMAGE_CONSTANTS } from "@constants/imageConstants";
import { CouponInput } from "./CouponInput";
import { useCouponForm } from "../hooks/useCouponForm";
import * as S from "./Coupon.styled";

const CouponRegisterModal = ({ onClose }: { onClose: () => void }) => {
  const { bind, radio, isReady, toPayload } = useCouponForm();
  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    console.log("버튼클릭");
    const payload = toPayload();
    console.log(payload);
    console.log("제출 완");
  };

  return (
    <S.Wrapper>
      <S.ModalBody>
        <S.TopModalWrapper>
          쿠폰등록
          <S.BtnClose type="button" onClick={onClose}>
            <img src={IMAGE_CONSTANTS.CLOSE} alt="닫기" />
          </S.BtnClose>
        </S.TopModalWrapper>
        <S.DividerLine />
        <S.FormContentWrapper>
          <CouponInput
            Title="쿠폰명"
            placeholderText="예) 최초 1회 주문 시 5000원 할인"
            type="text"
            {...bind.name}
          />
          <CouponInput
            Title="쿠폰상세"
            placeholderText="예) 첫 주문 금액에서 5000원이 차감됩니다."
            type="text"
            isEssential={false}
            {...bind.detail}
          />

          <CouponInput
            Title="할인유형"
            type="radio"
            name="discountType"
            options={[
              { label: "가격", value: "price" },
              { label: "할인율(%)", value: "rate" },
            ]}
            value={radio.discountType}
            onChange={(v) => radio.set(v as "price" | "rate")}
          />

          {radio.discountType === "price" && (
            <CouponInput
              Title="할인 가격"
              type="number"
              placeholderText="예) 5000"
              {...bind.price}
            />
          )}
          {radio.discountType === "rate" && (
            <CouponInput
              Title="할인율"
              type="number"
              placeholderText="예) 10"
              {...bind.price}
              helperText="* 최대 할인율은 100% 입니다."
              hasError={Number(bind.price.value) > 100}
            />
          )}
          <CouponInput
            Title="수량"
            placeholderText="예) 30"
            type="number"
            {...bind.qty}
          />
        </S.FormContentWrapper>
      </S.ModalBody>
      <S.BottomBtnContainer>
        <S.BottomBtn type="button" disabled={false} onClick={onClose}>
          취소
        </S.BottomBtn>
        <S.BottomBtn type="submit" disabled={!isReady} onClick={handleSubmit}>
          쿠폰등록
        </S.BottomBtn>
      </S.BottomBtnContainer>
    </S.Wrapper>
  );
};

export default CouponRegisterModal;
