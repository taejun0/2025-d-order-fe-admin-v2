// Top3Section.tsx
import * as S from '../DashboardPage.styled';
import Rank1 from '../../../assets/icons/Rank1.svg';
import Rank2 from '../../../assets/icons/Rank2.svg';
import Rank3 from '../../../assets/icons/Rank3.svg';
import DefaultImage from '../../../assets/images/character.svg';
import { TopMenuItem } from '../_services/dashboard.types';

const rankImg = { 1: Rank1, 2: Rank2, 3: Rank3 } as const;

type Props = { items: TopMenuItem[] };

export default function Top3Section({ items }: Props) {
  const hasItems = items && items.length > 0;

  return (
    <S.Top3>
      <S.SectionTitle>실시간 매출 TOP3 메뉴</S.SectionTitle>
      {hasItems ? (
        <S.CardGrid columns={3}>
          {items.map((m, idx) => {
            const rank = (idx + 1) as 1 | 2 | 3;
            return (
              <S.MenuCard key={`${m.name || 'no-name'}-${idx}`}>
                <S.RankingImage src={rankImg[rank]} />
                <S.Image
                  src={m.imageUrl || DefaultImage}
                  onError={(e) => (e.currentTarget.src = DefaultImage)}
                  alt={m.name}
                  $isDefault={!m.imageUrl}
                />
                <S.Line>
                  <S.ItemName>{m.name}</S.ItemName>
                  <S.ItemAmount $Focused>{m.price}원</S.ItemAmount>
                </S.Line>
                <S.Line>
                  <S.ItemCost $Focused>판매 수량</S.ItemCost>
                  <S.ItemAmount $Focused>{m.quantity}개</S.ItemAmount>
                </S.Line>
              </S.MenuCard>
            );
          })}
        </S.CardGrid>
      ) : (
        <S.CardGrid2 columns={3}>
          <S.EmptyMessage></S.EmptyMessage>
          <S.EmptyMessage>아직 영업 전입니다.</S.EmptyMessage>
        </S.CardGrid2>
      )}
    </S.Top3>
  );
}
