import * as S from '../DashboardPage.styled';
import { DayOfMoney } from '../_services/dashboard.types';

type Props = { stat: DayOfMoney };
export default function MoneyPanel({ stat }: Props) {
  return (
    <S.MoneyPanel>
      <S.SectionTitle>일 매출 현황</S.SectionTitle>
      {!stat?.day1_revenue && !stat?.day2_revenue && !stat?.day3_revenue ? (
        <S.EmptyMessage>아직 영업 전입니다.</S.EmptyMessage>
      ) : null}
      {stat?.day1_revenue > 0 && (
        <>
          <S.MoneyCon>
            <S.MoneyDay>9/24</S.MoneyDay>
            <S.MoneyDay>{stat?.day1_revenue}원</S.MoneyDay>
          </S.MoneyCon>
          <S.MoneyLine />
        </>
      )}
      {stat?.day2_revenue > 0 && (
        <>
          <S.MoneyCon>
            <S.MoneyDay>9/25</S.MoneyDay>
            <S.MoneyDay>{stat?.day2_revenue}원</S.MoneyDay>
          </S.MoneyCon>
          <S.MoneyLine />
        </>
      )}
      {stat?.day3_revenue > 0 && (
        <>
          <S.MoneyCon>
            <S.MoneyDay>9/26</S.MoneyDay>
            <S.MoneyDay>{stat?.day3_revenue}원</S.MoneyDay>
          </S.MoneyCon>
        </>
      )}
      <S.PanelDivider />
    </S.MoneyPanel>
  );
}
