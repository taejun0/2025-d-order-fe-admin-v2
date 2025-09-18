import styled, { css } from 'styled-components';

interface Props {
    resetTable: () => void;
    onCancel: () => void;
}

const ResetModal: React.FC<Props> = ({ resetTable, onCancel }) => {
    return (
        <Overlay>
        <Modal>
            <TextWrapper>
                <p>테이블을 초기화 하시겠어요?</p>
            </TextWrapper>
            <ButtonRow>
                        <ButtonContainer1>
                            <button onClick={onCancel}>취소</button>
                        </ButtonContainer1>
                        <ButtonContainer2>
                            <button onClick={resetTable}>테이블 초기화</button>
                        </ButtonContainer2>
                    </ButtonRow>
        </Modal>
        </Overlay>
    );
};

export default ResetModal;

const Overlay = styled.div`
    position: fixed;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 999; 
`;

const Modal = styled.div`
    position: fixed;
    top: 40%;
    left: 50%;
    min-width: 22rem;
    min-height: 9rem;
    transform: translate(-50%, -30%);
    background: white;
    /* padding: 0.2rem 0; */
    border-radius: 1rem;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
    z-index: 1000;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
`;

const TextWrapper = styled.div`
    width: 100%;
    padding: 2.5rem 0 2.2rem;
    gap: 1rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    border-bottom: 1px solid ${({theme}) => theme.colors.Black02};
    ${({ theme }) => css(theme.fonts.Bold20)};
    .grayText{
        line-height: 23px;
        color: ${({theme}) => theme.colors.Black02};
        ${({ theme }) => css(theme.fonts.SemiBold14)};
    }
`;

const ButtonRow = styled.div`
    display: flex;
    justify-content: space-between;
    width: 100%;
    min-height: 3.5rem;
`;
    

const ButtonContainer1 = styled.div`
    width: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    color: ${({theme}) => theme.colors.Orange01};
    border-right: 1px solid ${({theme}) => theme.colors.Black02};
    button {
        color: ${({theme}) => theme.colors.Orange01};
        ${({ theme }) => css(theme.fonts.Medium16)};
    }
`;

const ButtonContainer2 = styled.div`
    width: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    color: ${({theme}) => theme.colors.Orange01};
    button {
        color: ${({theme}) => theme.colors.Orange01};
        ${({ theme }) => css(theme.fonts.Bold16)};
    }
`;
