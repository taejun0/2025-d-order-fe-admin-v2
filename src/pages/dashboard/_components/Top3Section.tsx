import * as S from '../DashboardPage.styled';
import Rank1 from '../../../assets/icons/Rank1.svg';
import Rank2 from '../../../assets/icons/Rank2.svg';
import Rank3 from '../../../assets/icons/Rank3.svg';
import DefaultImage from '../../../assets/images/character.svg';
import { TopMenuItem } from '../_services/dashboard.types';

const rankImg = { 1: Rank1, 2: Rank2, 3: Rank3 } as const;

type Props = { items: TopMenuItem[] };

export default function Top3Section({ items }: Props) {
  return (
    <S.Top3>
      <S.SectionTitle>실시간 매출 TOP3 메뉴</S.SectionTitle>
      <S.CardGrid columns={3}>
        {items.map((m) => (
          <S.MenuCard key={m.id}>
            <S.RankingImage src={rankImg[m.rank]} />
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
              <S.ItemCost Focused>판매 수량</S.ItemCost>
              <S.ItemAmount Focused>{m.soldQty}개</S.ItemAmount>
            </S.Line>
          </S.MenuCard>
        ))}
      </S.CardGrid>
    </S.Top3>
  );
}
