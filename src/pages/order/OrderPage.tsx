import { useState } from 'react';
import * as S from './OrderPage.styled';
import { useOrdersData } from './hooks/useOrderData';
import KitchenView from './_components/views/KitchenView';
import ServingView from './_components/views/ServingView';

type ViewMode = 'kitchen' | 'serving';

const OrderPage = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('kitchen');
  const orderData = useOrdersData();

  if (orderData.isLoading && orderData.orders.length === 0) {
    return <S.LoadingContainer>주문 데이터를 불러오는 중...</S.LoadingContainer>;
  }

  return (
    <S.OrderPageWrapper>
      <S.ViewModeSelector>
        <S.ViewModeButton $active={viewMode === 'kitchen'} onClick={() => setViewMode('kitchen')}>
          주방
        </S.ViewModeButton>
        <S.ViewModeButton $active={viewMode === 'serving'} onClick={() => setViewMode('serving')}>
          서빙
        </S.ViewModeButton>
      </S.ViewModeSelector>
      <S.ContentWrapper>
        {viewMode === 'kitchen' ? <KitchenView {...orderData} /> : <ServingView {...orderData} />}
      </S.ContentWrapper>
    </S.OrderPageWrapper>
  );
};

export default OrderPage;