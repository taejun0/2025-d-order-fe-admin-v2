// WaitPanel.tsx
import * as S from '../DashboardPage.styled';
import { WaitStat } from '../_services/dashboard.types';

type Props = { stat: WaitStat };

export default function WaitPanel({ stat }: Props) {
  return (
    <S.WaitPanel>
      <S.SectionTitle>메뉴 평균 대기 시간</S.SectionTitle>
      <S.Donut>
        <span>{stat.avgWaitTimeMin}분</span>
      </S.Donut>
      <S.PanelDivider />
      {/* <S.PanelRow>
        <S.PenelHeight>
          <S.PanelSmall>메뉴별 평균 대기 시간</S.PanelSmall>
          <S.PanelStrong>{stat.avgWaitTimeMin}분</S.PanelStrong>
        </S.PenelHeight>
        <S.RowLine $check />
        <S.PenelHeight>
          <S.PanelSmall>서빙 대기 메뉴</S.PanelSmall>
          <S.PanelStrong $orange>{stat.waitingCount}개</S.PanelStrong>
        </S.PenelHeight>
      </S.PanelRow> */}
    </S.WaitPanel>
  );
}
