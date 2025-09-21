import * as S from "./LiveOrderPage.styled";
import MenuList from "./_components/menulist/MenuList";
import TableList from "./_components/tablelist/TableList";
import { useLiveOrdersWebSocket } from "./hooks/useLiveOrdersWebSocket";
const LiveOrderPage = () => {
  const accessToken = localStorage.getItem("accessToken");
  useLiveOrdersWebSocket(accessToken);

  return (
    <S.LiveOrderPageWrapper>
      <MenuList />
      <TableList />
    </S.LiveOrderPageWrapper>
  );
};

export default LiveOrderPage;
