import { instance } from '@services/instance';
import { DashboardData } from './dashboard.types';

// 필요 시 개별 API로 쪼갤 수도 있음
export async function fetchDashboard(): Promise<DashboardData> {
  const res = await instance.get('/api/v2/dashboard'); // 엔드포인트는 예시
  return res.data.data as DashboardData;
}
