import styled from "styled-components";

const Modal = ({
  onCancel,
  onLogout,
}: {
  onCancel: () => void;
  onLogout: () => void;
}) => {
  return (
    <Overlay>
      <Container>
        <Title>로그아웃 하시겠어요?</Title>
        <Bottom>
          <Cancel onClick={onCancel}>취소</Cancel>
          <Logout onClick={onLogout}>로그아웃</Logout>
        </Bottom>
      </Container>
    </Overlay>
  );
};

export default Modal;

const Overlay = styled.section`
  position: fixed;
  top: 0;
  left: 0%;
  z-index: 999;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
`;

const Container = styled.section`
  display: flex;
  flex-direction: column;
  width: 23.75rem;
  height: 9.75rem;
  background-color: ${({ theme }) => theme.colors.Gray01};
  border-radius: 0.875rem;
  z-index: 1000;
  pointer: cursor;
`;

const Title = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 6.375rem;
  ${({ theme }) => theme.fonts.Bold20};
`;

const Bottom = styled.div`
  display: flex;
  height: 3.375rem;
  border-top: 0.5px solid ${({ theme }) => theme.colors.Black02};

cursor: pointer;
`;

const Cancel = styled.div`
  display: flex;
  width: 50%;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.Orange01};
  ${({ theme }) => theme.fonts.Medium16};
  border-right: 0.5px solid ${({ theme }) => theme.colors.Black02};
`;

const Logout = styled.div`
  display: flex;
  width: 50%;
  justify-content: center;
  align-items: center;
  text-align: center;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.Orange01};
  ${({ theme }) => theme.fonts.Medium16};
`;
