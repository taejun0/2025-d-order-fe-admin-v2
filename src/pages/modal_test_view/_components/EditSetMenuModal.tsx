import { useEffect, useRef, useState } from "react";
import * as S from "./styled";
import preUploadImg from "@assets/images/preUploadImg.png";
import { IMAGE_CONSTANTS } from "@constants/imageConstants";
import { HandleNumberInput } from "../_utils/HandleNumberInput";
import MenuDropdown from "@pages/menu/_components/MenuDropdown";
import { BoothMenuData, SetMenu } from "@pages/menu/Type/Menu_type";
import MenuServiceWithImg from "@services/MenuServiceWithImg";
import { compressImage } from "../_utils/ImageCompress";

interface EditSetMenuModalProps {
  handleCloseModal: () => void;
  boothMenuData: BoothMenuData | undefined;
  setMenu: SetMenu;
  onSuccess: () => void;
}

type SetItem = {
  menuId: number | null;
  menuName: string;
  amount: number;
  isOpen: boolean;
};

const EditSetMenuModal = ({
  handleCloseModal,
  boothMenuData,
  setMenu,
  onSuccess,
}: EditSetMenuModalProps) => {
  const [buttonDisable, setButtonDisable] = useState<boolean>(true);
  const [name, setName] = useState<string>("");
  const [desc, setDesc] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [setItems, setSetItems] = useState<SetItem[]>([]);
  const [uploadImg, setUploadImg] = useState<string | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setName(setMenu.set_name);
    setDesc(setMenu.set_description);
    setPrice(String(setMenu.set_price));
    const idToName = (id: number) =>
      boothMenuData?.menus.find((m) => m.menu_id === id)?.menu_name || "";
    setSetItems(
      (setMenu.menu_items || []).map((mi) => ({
        menuId: mi.menu_id,
        menuName: idToName(mi.menu_id),
        amount: mi.quantity,
        isOpen: false,
      }))
    );
    setUploadImg(setMenu.set_image || null);
  }, [setMenu, boothMenuData]);

  useEffect(() => {
    if (name && price && setItems.length > 0) setButtonDisable(false);
    else setButtonDisable(true);
  }, [name, price, setItems]);

  const handleAddSetItem = () => {
    setSetItems((prev) => [
      ...prev,
      { menuId: null, menuName: "", amount: 1, isOpen: true },
    ]);
  };
  const handleChangeSelected = (idx: number, id: number, menuName: string) => {
    setSetItems((prev) =>
      prev.map((it, i) =>
        i === idx ? { ...it, menuId: id, menuName, isOpen: false } : it
      )
    );
  };
  const handleChangeAmount = (idx: number, value: number) => {
    setSetItems((prev) =>
      prev.map((it, i) => (i === idx ? { ...it, amount: value } : it))
    );
  };
  const handleToggleOpen = (idx: number) => {
    setSetItems((prev) =>
      prev.map((it, i) => ({
        ...it,
        isOpen: i === idx ? !it.isOpen : false,
      }))
    );
  };
  const handleRemoveItem = (idx: number) => {
    setSetItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setUploadImg(url);
    setImage(file);
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value || "";
    const digitsOnly = raw.replace(/\D/g, "");
    if (!digitsOnly) {
      setPrice("");
      return;
    }
    const num = Number(digitsOnly);
    const clamped = Math.min(num, 100000);
    setPrice(String(clamped));
  };

  const handleRemoveImage = (e?: React.MouseEvent<HTMLButtonElement>) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (uploadImg) {
      URL.revokeObjectURL(uploadImg);
    }
    setUploadImg(null);
    setImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 업로드 이미지 크기 제한 10MB
  const MIN_FILE_SIZE = 2.5 * 1024 * 1024;
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || setItems.length === 0) {
      alert("모든 필수 항목을 채워주세요.");
      return;
    }

    // 멀티파트로 업데이트 (이미지 포함)
    const formData = new FormData();
    formData.append("set_name", name);
    formData.append("set_description", desc || "");
    formData.append("set_price", String(Number(price)));
    formData.append(
      "menu_items",
      JSON.stringify(
        setItems
          .filter((i) => i.menuId !== null)
          .map((i) => ({ menu_id: i.menuId as number, quantity: i.amount }))
      )
    );

    if (image) {
      if (image.size > MAX_FILE_SIZE) {
        alert("이미지 용량이 10mb 를 초과하였습니다!");
        return;
      }
      const fileToUpload =
        image.size <= MIN_FILE_SIZE ? image : await compressImage(image);
      formData.append("set_image", fileToUpload);
    }

    if (image === null) {
      try {
        formData.append("set_image", "");
        await MenuServiceWithImg.updateSetMenu(setMenu.set_menu_id, formData);
        setButtonDisable(false);
        onSuccess();
      } catch (err) {
        console.log(err);
      } finally {
        handleCloseModal();
      }
    } else {
      try {
        await MenuServiceWithImg.updateSetMenu(setMenu.set_menu_id, formData);
        onSuccess();
      } catch (error) {
        console.log(error);
      } finally {
        handleCloseModal();
      }
    }
  };

  return (
    <S.Wrapper onSubmit={handleSubmit}>
      <S.ModalBody>
        <S.ModalHeader>
          메뉴 수정
          <button type="button" onClick={handleCloseModal}>
            <img src={IMAGE_CONSTANTS.CLOSE} alt="닫기" />
          </button>
        </S.ModalHeader>
        <S.FormContentWrapper>
          <S.ele>
            <S.SubTitle>
              메뉴명<span>*</span>
            </S.SubTitle>
            <S.inputText
              type="text"
              placeholder="예) 세트A"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={20}
            />
          </S.ele>
          <S.ele>
            <S.SubTitle>메뉴 설명</S.SubTitle>
            <S.inputText
              type="text"
              placeholder="예) 인기 메뉴 조합"
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
              onChange={handlePriceChange}
              onInput={HandleNumberInput}
            />
          </S.ele>
          <S.ele>
            <S.setComposition>
              <S.SubTitle>
                메뉴 구성<span>*</span>
              </S.SubTitle>
              <button type="button" onClick={handleAddSetItem}>
                + 추가
              </button>
            </S.setComposition>
            {setItems.map((it, idx) => (
              <MenuDropdown
                key={idx}
                isOpen={it.isOpen}
                setIsOpen={() => handleToggleOpen(idx)}
                boothMenuData={boothMenuData}
                selectedId={it.menuId}
                selectedName={it.menuName}
                onChangeSelected={(id, name) =>
                  handleChangeSelected(idx, id, name)
                }
                amount={it.amount}
                onChangeAmount={(val) => handleChangeAmount(idx, val)}
                onRemove={() => handleRemoveItem(idx)}
              />
            ))}
          </S.ele>
          <S.ele>
            <S.SubTitle>세트 이미지</S.SubTitle>
            <S.OtherText>이미지 파일 (JPG,PNG)을 첨부해 주세요</S.OtherText>
            <label htmlFor="set-file-upload">
              <S.inputImg
                id="set-file-upload"
                type="file"
                accept=".jpg,.png,.jpeg"
                onChange={handleFileChange}
                multiple={false}
                ref={fileInputRef}
              />
              {uploadImg ? (
                <S.ImgContainer>
                  <S.Img src={uploadImg} alt="첨부한 이미지" />
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onClick={handleRemoveImage}
                  >
                    <img src={IMAGE_CONSTANTS.CLOSE2} alt="" />
                  </button>
                </S.ImgContainer>
              ) : (
                <img src={preUploadImg} alt="기존 이미지" />
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
          메뉴 수정
        </button>
      </S.ModalConfirmContainer>
    </S.Wrapper>
  );
};

export default EditSetMenuModal;
