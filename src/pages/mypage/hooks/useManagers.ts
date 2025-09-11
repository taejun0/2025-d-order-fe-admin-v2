// mypage/hooks/useManagers.ts
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ApiEnvelope,
  ManagerInfo,
  getManagerInfo,
  patchManagerInfo,
  normalizeSeatFields,
} from "../apis/getManagers";

type LoadState<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
};

type UpdateState = {
  updating: boolean;
  updateError: string | null;
};

export interface UseManagersOptions {
  /** 마운트 시 자동 로드 여부 (기본 true) */
  autoLoad?: boolean;
  /** 명시 토큰(미지정 시 localStorage에서 탐색) */
  token?: string;
}

/**
 * 운영자 정보 조회/수정 훅
 * - data, loading, error
 * - reload()
 * - update(patch)
 */
export function useManagers(options: UseManagersOptions = {}) {
  const { autoLoad = true, token } = options;

  const [state, setState] = useState<LoadState<ManagerInfo>>({
    data: null,
    loading: autoLoad,
    error: null,
  });

  const [uState, setUState] = useState<UpdateState>({
    updating: false,
    updateError: null,
  });

  const hasData = useMemo(() => !!state.data, [state.data]);

  const reload = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const res = await getManagerInfo({ token });
      // 예상 성공: { message, code:200, data: { ... } }
      setState({ data: res.data, loading: false, error: null });
      return res;
    } catch (e: any) {
      setState((s) => ({
        ...s,
        loading: false,
        error: e?.message ?? "운영자 정보를 불러오는 중 오류가 발생했습니다.",
      }));
      return null;
    }
  }, [token]);

  const update = useCallback(
    async (patch: Partial<ManagerInfo>, opts?: { normalizeSeat?: boolean }) => {
      setUState({ updating: true, updateError: null });
      try {
        const payload =
          opts?.normalizeSeat === false ? patch : normalizeSeatFields(patch);

        const res = await patchManagerInfo(payload, { token });
        // 서버에서 최신 data 반환 → 상태 갱신
        setState({ data: res.data, loading: false, error: null });
        setUState({ updating: false, updateError: null });
        return res;
      } catch (e: any) {
        setUState({
          updating: false,
          updateError:
            e?.message ?? "운영자 정보를 수정하는 중 오류가 발생했습니다.",
        });
        return null;
      }
    },
    [token]
  );

  useEffect(() => {
    if (autoLoad) void reload();
  }, [autoLoad, reload]);

  return {
    /** 조회 상태 */
    data: state.data,
    loading: state.loading,
    error: state.error,

    /** 수정 상태 */
    updating: uState.updating,
    updateError: uState.updateError,

    /** 액션 */
    reload,
    update,
    hasData,
  };
}

