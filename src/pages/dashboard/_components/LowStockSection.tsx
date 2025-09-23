import * as S from '../DashboardPage.styled';
import DefaultImage from '../../../assets/images/character.svg';
import { LowStockItem } from '../_services/dashboard.types';

type Props = { items: LowStockItem[] };

export default function LowStockSection({ items }: Props) {
  const hasItems = items && items.length > 0;

  return (
    <S.LowStock>
      <S.SectionTitle>품절 임박 메뉴</S.SectionTitle>

      {hasItems ? (
        <S.CardGrid columns={3}>
          {items.map((m, idx) => (
            <S.MenuCard key={`${m.name || 'no-name'}-${idx}`}>
              <S.Image
                src={m.imageUrl || DefaultImage}
                onError={(e) => (e.currentTarget.src = DefaultImage)}
                alt={m.name}
                $isDefault={!m.imageUrl}
              />
              <S.Line>
                <S.ItemName>{m.name}</S.ItemName>
                {m.price && <S.ItemAmount>{m.price}원</S.ItemAmount>}
              </S.Line>
              <S.Line>
                <S.ItemCost>남은 수량</S.ItemCost>
                <S.ItemAmount>{m.remaining}개</S.ItemAmount>
              </S.Line>
            </S.MenuCard>
          ))}
        </S.CardGrid>
      ) : (
        <S.CardGrid2 columns={3}>
          <S.EmptyMessage></S.EmptyMessage>
          <S.EmptyMessage>아직 품절 임박 메뉴가 없습니다.</S.EmptyMessage>
        </S.CardGrid2>
      )}
    </S.LowStock>
  );
}
