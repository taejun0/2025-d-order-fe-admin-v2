import * as S from "../MyPage.styled";
import qr from "../../../assets/icons/qr.svg";
import logout from "../../../assets/icons/logout.svg";

type Props = {
    onClickQR: () => void;
    onClickLogout: () => void;
};

const BottomActions = ({ onClickQR, onClickLogout }: Props) => {
    return (
        <S.BottomContainer>
        <S.QrContainer onClick={onClickQR}>
            <S.QrImg src={qr} />
            <span>QR 코드 다운로드</span>
        </S.QrContainer>
        <S.LogoutContainer onClick={onClickLogout}>
            <S.LogoutImg src={logout} />
            <span>로그아웃</span>
        </S.LogoutContainer>
        </S.BottomContainer>
    );
};
export default BottomActions;
