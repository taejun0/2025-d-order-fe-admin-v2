import styled from "styled-components";

export const Overlay = styled.section`
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
`;

export const Container = styled.section`
  display: flex;
  flex-direction: column;
  width: 23.75rem;
  background-color: ${({ theme }) => theme.colors.Gray01};
  border-radius: 0.875rem;
  z-index: 1000;
`;

export const TextWrapper = styled.div`
  display: flex;
  flex-direction: column;

  align-items: center;
  width: 100%;

  margin-top: 42px;
  margin-bottom: 30px;
`;

export const Title = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  /* height: 6.375rem; */
  ${({ theme }) => theme.fonts.Bold20}

  margin-bottom: 15px;
`;
export const SubTitle = styled.div`
  display: flex;
  justify-content: center;
  color: ${({ theme }) => theme.colors.Focused};
  ${({ theme }) => theme.fonts.SemiBold14};
`;
export const Bottom = styled.div`
  display: flex;
  height: 3.375rem;
  border-top: 0.5px solid ${({ theme }) => theme.colors.Black02};
`;

export const Cancel = styled.div`
  display: flex;
  width: 50%;
  cursor: pointer;
  justify-content: center;
  align-items: center;
  color: ${({ theme }) => theme.colors.Orange01};
  ${({ theme }) => theme.fonts.Medium16};
  border-right: 0.5px solid ${({ theme }) => theme.colors.Black02};
`;

export const Logout = styled.div`
  display: flex;
  cursor: pointer;
  width: 50%;
  justify-content: center;
  align-items: center;
  text-align: center;
  color: ${({ theme }) => theme.colors.Orange01};
  ${({ theme }) => theme.fonts.Medium16};
`;
