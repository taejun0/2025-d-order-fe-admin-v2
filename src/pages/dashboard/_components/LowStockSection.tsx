import * as S from '../DashboardPage.styled';
import DefaultImage from '../../../assets/images/character.svg';
import { LowStockItem } from '../_services/dashboard.types';

type Props = { items: LowStockItem[] };

export default function LowStockSection({ items }: Props) {
  return (
    <S.LowStock>
      <S.SectionTitle>품절 임박 메뉴</S.SectionTitle>
      <S.CardGrid columns={3}>
        {items.map((m) => (
          <S.MenuCard key={m.id}>
            <S.Image
              src={m.imageUrl || DefaultImage}
              onError={(e) => (e.currentTarget.src = DefaultImage)}
              alt={m.name}
            />
            <S.Line>
              <S.ItemName>{m.name}</S.ItemName>
              <S.ItemCost Focused>{m.price.toLocaleString()}원</S.ItemCost>
            </S.Line>
            <S.Line>
              <S.ItemCost>남은 수량</S.ItemCost>
              <S.ItemAmount>{m.leftQty}개</S.ItemAmount>
            </S.Line>
          </S.MenuCard>
        ))}
      </S.CardGrid>
    </S.LowStock>
  );
}
