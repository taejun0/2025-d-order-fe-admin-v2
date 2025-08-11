import { IMAGE_CONSTANTS } from "@constants/imageConstants";
import * as S from "./Coupon.styled";
const CouponRegisterModal = () => {
  return (
    <S.Wrapper>
      <S.ModalBody>
        쿠폰등록
        <button type="button" onClick={() => console.log("닫기")}>
          <img src={IMAGE_CONSTANTS.CLOSE} alt="닫기" />
        </button>
        <S.FormContentWrapper>
          <S.ele>
            <S.SubTitle>
              쿠폰명<span>*</span>
            </S.SubTitle>
            <S.inputText
              type="text"
              placeholder="예) 최초 1회 주문 시 5000원 할인"
              maxLength={20}
            />
          </S.ele>

          <S.ele>
            <S.SubTitle>쿠폰상세</S.SubTitle>
            <S.inputText
              type="text"
              placeholder="예) 첫 주문 금액에서 5000원이 차감됩니다."
              maxLength={20}
            />
          </S.ele>
          <S.ele>
            <S.SubTitle>
              할인 가격<span>*</span>
            </S.SubTitle>
            <S.inputText type="text" placeholder="예) 5000" maxLength={20} />
          </S.ele>
          {/* <S.ele>
            <S.SubTitle>할인유형</S.SubTitle>
          </S.ele> */}
          <S.ele>
            <S.SubTitle>
              수량 <span>*</span>
            </S.SubTitle>
            <S.inputText type="text" placeholder="예) 30" maxLength={20} />
          </S.ele>
        </S.FormContentWrapper>
      </S.ModalBody>
    </S.Wrapper>
  );
};

export default CouponRegisterModal;
