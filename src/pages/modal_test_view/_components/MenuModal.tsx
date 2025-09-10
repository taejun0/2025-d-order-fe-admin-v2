import preUploadImg from "@assets/images/preUploadImg.png";
import * as S from "./styled";
import { useState, useEffect } from "react";
import MenuService from "@services/MenuService";
import { IMAGE_CONSTANTS } from "@constants/imageConstants";
// import CommonDropdown from "@pages/signup/_components/inputs/dropdown/CommonDropdown";
import MenuDropdown from "@pages/menu/_components/MenuDropdown";
import MenuServiceWithImg from "@services/MenuServiceWithImg";
import { HandleNumberInput } from "../_utils/HandleNumberInput";
import { compressImage } from "../_utils/ImageCompress";

interface MenuModalProps {
  handleCloseModal: () => void;
  onSuccess?: () => void;
  defaultValues?: {
    menu_id: number;
    menu_name: string;
    menu_description: string;
    menu_category: string;
    menu_price: number;
    menu_amount?: number;
    menu_image?: File | string | null; // URL
  };
}

const MAX_FILE_SIZE = 3 * 1024 * 1024; // 업로드 이미지 크기 제한 3MB
const MIN_FILE_SIZE = 2.5 * 1024 * 1024;

const MenuModal = ({ handleCloseModal, onSuccess }: MenuModalProps) => {
  const [UploadImg, setUploadImg] = useState<string | null>(null);
  const [buttonDisable, setButtonDisable] = useState<boolean>(true);

  const [category, setCategory] = useState<string>("메뉴");
  const [name, setName] = useState<string>("");
  const [desc, setDesc] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [stock, setStock] = useState<string>("");
  const [image, setImage] = useState<File | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  // dummy data
  // const menuCompositionOptions = ["메뉴", "음료", "세트"];
  // const [menuComposition, setMenuComposition] = useState<string>("메뉴");
  // const onChangeMenuComposition = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   setMenuComposition(e.target.value);
  // };

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

  // 옵션 추가
  const addOption = () => {};
  // 제출 이벤트
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
    formData.append("menu_amount", stock);
    if (image) {
      if (image.size <= MIN_FILE_SIZE) {
        formData.append("menu_image", image);
      } else {
        try {
          const correctedFile = await compressImage(image);
          formData.append("menu_image", correctedFile);
        } catch (e) {
          console.log(e);
        }
      }
      if (category !== "세트") {
        try {
          await MenuServiceWithImg.createMenu(formData);

          handleCloseModal();
        } catch (e) {
          alert("dddd");
          console.log(e);
        }
      } else {
        // 세트 메뉴일 경우 로직
      }
    }
    // 이미지 없을 경우
    else {
      if (category !== "세트") {
        try {
          await MenuService.createMenu(formData);
          handleCloseModal();
        } catch (e) {
          console.log(e);
        }
      } else {
        try {
          // 세트 메뉴 일 경우 로직 추가
          handleCloseModal();
        } catch (e) {
          console.log(e);
        }
      }
    }
  };
  return (
    <S.Wrapper onSubmit={handleSubmit}>
      <S.ModalBody>
        <S.ModalHeader>
          메뉴 등록
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
              <label className="custom-label">
                <input
                  type="radio"
                  name="category"
                  value="세트"
                  onChange={() => setCategory("세트")}
                  checked={category === "세트"}
                />
                세트
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
              onInput={HandleNumberInput}
            />
          </S.ele>
          {category === "세트" && (
            <S.ele>
              <S.setComposition>
                <S.SubTitle>
                  메뉴 구성<span>*</span>
                </S.SubTitle>
                <button type="button" onClick={addOption}>
                  + 추가
                </button>
              </S.setComposition>
              <MenuDropdown
                isOpen={isOpen}
                setIsOpen={setIsOpen}
              ></MenuDropdown>
            </S.ele>
          )}
          {category !== "세트" && (
            <S.ele>
              <S.SubTitle>
                재고수량<span>*</span>
              </S.SubTitle>
              <S.inputText
                type="number"
                placeholder="예) 100"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                onInput={HandleNumberInput}
              />
            </S.ele>
          )}
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
          메뉴 등록
        </button>
      </S.ModalConfirmContainer>
    </S.Wrapper>
  );
};

export default MenuModal;
