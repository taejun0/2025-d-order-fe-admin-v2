import { Outlet } from 'react-router-dom';
import styled from 'styled-components';
import useAuthRedirect from '@hooks/useAuthRedirect';
import backIMAGES from '/images/background.webp';

const UserLayout = () => {
  useAuthRedirect();
  return (
    <Wrapper>
      <Background src={backIMAGES} />
      <Content>
        <Outlet />
      </Content>
    </Wrapper>
  );
};

export default UserLayout;

const Wrapper = styled.section`
  background-color: ${({ theme }) => theme.colors.Bg};
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  min-width: 340px;
  width: 100%;
`;

const Background = styled.img`
  position: fixed;
  top: 0;
  left: 0;
  width: 60vw;
  height: 100dvh;
  z-index: 0;
  pointer-events: none;
`;

const Content = styled.div`
  position: relative;
  z-index: 1;
  width: 100%;
`;
