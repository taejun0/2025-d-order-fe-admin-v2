import React from 'react';
import * as S from '../DashboardPage.styled';
import { DayOfMoney } from '../_services/dashboard.types';

type Props = { stat: DayOfMoney };

export default function MoneyPanel({ stat }: Props) {
  const entries = [
    stat?.day1_revenue && stat.day1_revenue > 0
      ? { label: '9/24', value: stat.day1_revenue }
      : null,
    stat?.day2_revenue && stat.day2_revenue > 0
      ? { label: '9/25', value: stat.day2_revenue }
      : null,
    stat?.day3_revenue && stat.day3_revenue > 0
      ? { label: '9/26', value: stat.day3_revenue }
      : null,
  ].filter(Boolean) as { label: string; value: number }[];

  const hasAny = entries.length > 0;

  return (
    <S.MoneyPanel>
      <S.SectionTitle>일 매출 현황</S.SectionTitle>

      {!hasAny && <S.EmptyMessage>아직 영업 전입니다.</S.EmptyMessage>}

      {entries.map((item, idx) => (
        <React.Fragment key={item.label}>
          {idx > 0 && <S.MoneyLine />}

          <S.MoneyCon>
            <S.MoneyDay>{item.label}</S.MoneyDay>
            <S.MoneyDay>{item.value}원</S.MoneyDay>
          </S.MoneyCon>
        </React.Fragment>
      ))}

      <S.PanelDivider />
    </S.MoneyPanel>
  );
}
