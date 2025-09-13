// src/pages/Dashboard/_hooks/useDashboard.ts
import { useEffect, useRef, useState, useCallback } from 'react';
import { fetchDashboard } from '../_services/dashboard.api';
import { mapDashboardResponse } from '../_services/dashboard.mapper';
import { DashboardData } from '../_services/dashboard.types';
import { dashboardMock } from '../_services/dashboard.mock';

export function useDashboard(pollMs = 0) {
  const [data, setData] = useState<DashboardData>(dashboardMock);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<Error | null>(null);
  const hasLoadedOnce = useRef(false);

  const load = useCallback(async () => {
    try {
      const raw = await fetchDashboard();
      const mapped = mapDashboardResponse(raw);
      setData(mapped);
      setErr(null);
    } catch (e: any) {
      setErr(e);
    } finally {
      setLoading(false);
      hasLoadedOnce.current = true;
    }
  }, []);

  useEffect(() => {
    load();
    if (!pollMs) return;
    const t = setInterval(load, pollMs);
    return () => clearInterval(t);
  }, [pollMs, load]);

  return { data, loading, err, reload: load, setData };
}
