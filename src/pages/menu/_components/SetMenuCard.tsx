import * as S from "./MenuCard.styled";
import { IMAGE_CONSTANTS } from "@constants/imageConstants";
import { useState } from "react";
import MenuModal from "../../modal_test_view/_components/MenuModal";
import MenuDeleteModal from "../../modal_test_view/_components/MenuDeleteModal";
import { SetMenu } from "../Type/Menu_type";

interface SetMenuCardProps {
  menu: SetMenu;
  onMenuChange: () => void;
}

const SetMenuCard = ({ menu, onMenuChange }: SetMenuCardProps) => {
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const isSoldOut = menu.is_sold_out;

  const handleEditClick = () => {
    setShowModal(true);
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
  };

  const handleConfirmDelete = async () => {
    try {
      // await MenuService.deleteMenu(menu.id);
      setShowDeleteModal(false);
      onMenuChange(); // 목록 새로고침
    } catch (error) {
      alert("메뉴 삭제에 실패했습니다.");
    }
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
            {menu.set_image ? (
              <img src={menu.set_image} alt={menu.set_name} />
            ) : (
              <S.DefaultCardImg>
                <img src={IMAGE_CONSTANTS.CHARACTER} alt={menu.set_name} />
              </S.DefaultCardImg>
            )}
            <S.DeleteBtn onClick={handleDeleteClick}>
              <img src={IMAGE_CONSTANTS.VECTOR} alt="삭제" />
            </S.DeleteBtn>
          </S.CardImg>
          <S.CardInfo>
            <S.MenuEditBtn onClick={handleEditClick}>
              <img src={IMAGE_CONSTANTS.MENUEDIT} alt="수정아이콘" />
              메뉴 수정
            </S.MenuEditBtn>
            <S.CardTextInner>
              <S.CardText className="bold">{menu.set_name}</S.CardText>
              <S.CardText>{menu.set_price.toLocaleString()}원</S.CardText>
            </S.CardTextInner>
            <S.CardTextInner>
              <S.CardText>재고수량</S.CardText>
              <S.CardText>
                {/* {menu.menu_amount !== undefined ? `${menu.menu_amount}개` : "-"} */}
                임시갯수
              </S.CardText>
            </S.CardTextInner>
          </S.CardInfo>
        </S.CardContents>
      </S.MenuCardWrapper>

      {/* {showModal && (
        <S.ModalWrapper onClick={handleCloseModal}>
          <div onClick={(e) => e.stopPropagation()}>
            <MenuModal
              handleCloseModal={handleCloseModal}
              text="메뉴 수정"
              isEdit={true}
              onSuccess={onMenuChange}
              defaultValues={{
                menu_id: menu.menu_id,
                menu_name: menu.menu_name,
                menu_description: menu.menu_description,
                menu_category: menu.menu_category,
                menu_price: menu.menu_price,
                menu_amount: menu.menu_amount,
                menu_image: menu.menu_image,
              }}
            />
          </div>
        </S.ModalWrapper>
      )} */}

      {showDeleteModal && (
        <MenuDeleteModal
          onCancel={handleCancelDelete}
          onDelete={handleConfirmDelete}
        />
      )}
    </>
  );
};

export default SetMenuCard;
