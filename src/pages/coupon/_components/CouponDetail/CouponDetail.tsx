import * as S from "./CouponDetail.styled";
import { useState } from "react";
import { DetailData } from "./DetailData";
import { CouponItem } from "./CouponItem";
import qr from "../../../../assets/icons/qr.svg";
import { DeleteModal } from "@components/DeleteModal/DeleteModal";
export const CouponDetail = () => {
  const [showDelete, setShowDelete] = useState(false);

  const handleCancel = () => {
    setShowDelete(false);
  };

  const handleDelete = () => {
    console.log("쿠폰 삭제 로직 실행");

    // setShowDelete(false);
  };
  return (
    <S.DetailBox>
      <S.DetailContainer>
        <S.DetailWrapper>
          <S.CouponDetailTitle>쿠폰 정보</S.CouponDetailTitle>
          <div>
            <S.DataContainer>
              <DetailData
                DataTitle="쿠폰명"
                DataContent="게임 승리 10% 할인 쿠폰"
              />
              <DetailData
                DataTitle="쿠폰 상세"
                DataContent="현재 주문 금액에서 10% 할인됩니다."
              />
              <DetailData DataTitle="할인 유형" DataContent="할인율(%)" />
              <DetailData DataTitle="할인율" DataContent="10" />
              <DetailData DataTitle="수량" DataContent="29/30" />
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
        <CouponItem code="A4TH78" isUsed={true} />
        <CouponItem code="A4TH78" isUsed={false} />
        <CouponItem code="A4TH78" isUsed={true} />
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
