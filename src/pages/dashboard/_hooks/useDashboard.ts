import { useEffect, useRef, useState } from 'react';
import { fetchDashboard } from '../_services/dashboard.api';
import { mapDashboardResponse } from '../_services/dashboard.mapper';
import { DashboardData } from '../_services/dashboard.types';
import { dashboardMock } from '../_services/dashboard.mock';

export function useDashboard(pollMs = 20000) {
  // ✅ 목 데이터를 기본값으로 넣어둔다
  const [data, setData] = useState<DashboardData>(dashboardMock);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<Error | null>(null);
  const hasLoadedOnce = useRef(false);

  async function load() {
    try {
      const raw = await fetchDashboard();
      const mapped = mapDashboardResponse({
        kpi: raw.kpi,
        top3: raw.top3,
        low_stock: raw.lowStock,
        wait: raw.wait,
      });
      setData(mapped);
      setErr(null);
    } catch (e: any) {
      setErr(e);
    } finally {
      setLoading(false);
      hasLoadedOnce.current = true;
    }
  }

  useEffect(() => {
    load();
    if (!pollMs) return;
    const t = setInterval(load, pollMs);
    return () => clearInterval(t);
  }, [pollMs]);

  return { data, loading, err, reload: load };
}
