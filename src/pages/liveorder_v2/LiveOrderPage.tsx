import * as S from "./LiveOrderPage.styled";
import MenuList from "./_components/menulist/MenuList";
import TableList from "./_components/tablelist/TableList";

const LiveOrderPage = () => {
  return (
    <S.LiveOrderPageWrapper>
      <MenuList />
      <TableList />
    </S.LiveOrderPageWrapper>
  );
};

export default LiveOrderPage;
