import styled from "styled-components";
import preUploadImg from "@assets/images/preUploadImg.png";
import * as S from "./styled";
import { useState, useEffect } from "react";
import MenuService from "@services/MenuService";
import imageCompression from "browser-image-compression";
import { IMAGE_CONSTANTS } from "@constants/imageConstants";

interface MenuModalProps {
  text: string;
  handleCloseModal: () => void;
  isEdit?: boolean;
  onSuccess?: () => void;
  defaultValues?: {
    menu_id: number;
    menu_name: string;
    menu_description: string;
    menu_category: string;
    menu_price: number;
    menu_amount?: number;
    menu_image?: string | null; // URL
  };
}

const MAX_FILE_SIZE = 3 * 1024 * 1024; // 업로드 이미지 크기 제한 3MB
const MIN_FILE_SIZE = 2.5 * 1024 * 1024;

const MenuModal2 = ({
  text,
  handleCloseModal,
  isEdit = false,
  onSuccess,
  defaultValues,
}: MenuModalProps) => {
  const [UploadImg, setUploadImg] = useState<string | null>(null);
  const [buttonDisable, setButtonDisable] = useState<boolean>(true);

  const [category, setCategory] = useState<string>("메뉴");
  const [name, setName] = useState<string | undefined>();
  const [desc, setDesc] = useState<string | undefined>();
  const [price, setPrice] = useState<string | undefined>();
  const [stock, setStock] = useState<string | undefined>();
  const [image, setImage] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const imgUrl = URL.createObjectURL(file);
    setUploadImg(imgUrl);
    setImage(file); // 선택한 파일 상태에 저장
  };
  useEffect(() => {
    if (name && price && stock && category) {
      setButtonDisable(false);
    } else {
      setButtonDisable(true);
    }
  }, [name, price, stock, category]);

  // 수정시 기본 값 가져오기
  useEffect(() => {
    if (defaultValues) {
      setName(defaultValues.menu_name);
      setDesc(defaultValues.menu_description || "");
      setPrice(String(defaultValues.menu_price));
      setStock(String(defaultValues.menu_amount));
      setUploadImg(defaultValues.menu_image || "");
      setCategory(defaultValues.menu_category);
      setButtonDisable(false); // 수정 시 버튼 활성화
    }
  }, [defaultValues]);

  // 숫자만 허용하는 함수
  const handleNumberInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // 숫자만 허용
    if (!/^\d*$/.test(value)) {
      e.target.value = value.replace(/[^\d]/g, ""); // 숫자만 남기고 나머지 제거
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!category || !name || !price || !stock) {
      alert("모든 필수 항목을 채워주세요.");
      return;
    }

    if (image && image.size > MAX_FILE_SIZE) {
      alert("파일 크기가 너무 큽니다. 최대 3MB까지 업로드 가능합니다.");
      return;
    }

    const formData = new FormData();
    formData.append("menu_name", name);
    formData.append("menu_description", desc || "");
    formData.append("menu_category", category);
    formData.append("menu_price", price);
    formData.append("menu_remain", stock);
    if (image) {
      if (image.size <= MIN_FILE_SIZE) {
        formData.append("menu_image", image);
      } else {
        try {
          const options = {
            maxSizeMB: 3,
            maxWidthOrHeight: 1024,
            useWebWorker: true,
          };
          const compressedFile = await imageCompression(image, options);
          const correctedFile = new File([compressedFile], image.name, {
            type: compressedFile.type,
          });
          formData.append("menu_image", correctedFile);
        } catch (e) {}
      }
    }
    try {
      if (isEdit && defaultValues?.menu_id !== undefined) {
        await MenuService.editMenu(formData, defaultValues.menu_id);
        handleCloseModal();
        if (onSuccess) onSuccess();
      } else {
        formData.delete("menu_remain");
        formData.append("menu_amount", stock);
        await MenuService.postMenu(formData);
        handleCloseModal();
        if (onSuccess) onSuccess();
      }
    } catch (e) {}
  };
  useEffect(() => {});
  return (
    <Wrapper onSubmit={handleSubmit}>
      <S.ModalBody>
        <S.ModalHeader>
          {text}
          <button type="button" onClick={handleCloseModal}>
            <img src={IMAGE_CONSTANTS.CLOSE} alt="닫기" />
          </button>
        </S.ModalHeader>
        <S.FormContentWrapper>
          <S.ele>
            <S.SubTitle>
              메뉴 카테고리<span>*</span>
            </S.SubTitle>
            <div>
              <label className="custom-label">
                <input
                  type="radio"
                  name="category"
                  value="메뉴"
                  onChange={() => setCategory("메뉴")}
                  checked={category === "메뉴"}
                />
                메뉴
              </label>
              <label className="custom-label">
                <input
                  type="radio"
                  name="category"
                  value="음료"
                  onChange={() => setCategory("음료")}
                  checked={category === "음료"}
                />
                음료
              </label>
            </div>
          </S.ele>
          <S.ele>
            <S.SubTitle>
              메뉴명<span>*</span>
            </S.SubTitle>
            <S.inputText
              type="text"
              placeholder="예) 피자"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={20}
            />
          </S.ele>
          <S.ele>
            <S.SubTitle>메뉴 설명</S.SubTitle>
            <S.inputText
              type="text"
              placeholder="예) 이탈리아의 풍미를 잔뜩 느낄 수 있는 피자에요."
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              maxLength={30}
            />
          </S.ele>
          <S.ele>
            <S.SubTitle>
              메뉴 가격<span>*</span>
            </S.SubTitle>
            <S.inputText
              type="text"
              placeholder="예) 20000"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              onInput={handleNumberInput}
            />
          </S.ele>
          <S.ele>
            <S.SubTitle>
              재고수량<span>*</span>
            </S.SubTitle>
            <S.inputText
              type="number"
              placeholder="예) 100"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              onInput={handleNumberInput}
            />
          </S.ele>
          <S.ele>
            <S.SubTitle>메뉴 이미지</S.SubTitle>
            <S.OtherText>이미지 파일 (JPG,PNG)을 첨부해 주세요</S.OtherText>
            <label htmlFor="file-upload">
              <S.inputImg
                id="file-upload"
                type="file"
                accept="*.jpg,.png,.jpeg"
                onChange={handleFileChange}
                multiple={false}
              />
              {UploadImg ? (
                <img src={UploadImg} alt="첨부한 이미지" />
              ) : (
                <img src={preUploadImg} alt="기본 이미지" />
              )}
            </label>
          </S.ele>
        </S.FormContentWrapper>
      </S.ModalBody>
      <S.ModalConfirmContainer>
        <button type="button" onClick={handleCloseModal}>
          취소
        </button>
        <button type="submit" disabled={buttonDisable}>
          {text}
        </button>
      </S.ModalConfirmContainer>
    </Wrapper>
  );
};

export default MenuModal2;

const Wrapper = styled.form`
  min-width: 600px;
  max-width: 700px;
  width: 80%;

  display: grid;
  grid-template-rows: 12fr 1fr;

  z-index: 10;
  background-color: ${({ theme }) => theme.colors.Gray01};

  border-radius: 10px;
`;
