import styled from 'styled-components';

export const BillWrapper = styled.div`
  width: 100%;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

export const BillHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background-color: ${({ theme }) => theme.colors.Black};
  color: #fff;
`;

export const TableNumber = styled.h3`
  font-size: 18px;
  font-weight: bold;
  margin: 0;
`;

export const OrderTime = styled.p`
  font-size: 14px;
  margin: 0;
`;

export const BillBody = styled.div`
  padding: 10px 20px 20px;
`;

export const BillCategory = styled.div`
  display: grid;
  grid-template-columns: 3fr 1fr 1.5fr;
  padding: 10px 0;
  border-bottom: 1px dashed ${({ theme }) => theme.colors.Gray01};
  margin-bottom: 10px;
  
  span {
    text-align: center;
    font-weight: bold;
    color: ${({ theme }) => theme.colors.Black02};
    font-size: 14px;
  }
`;