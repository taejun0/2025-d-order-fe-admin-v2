// mypage/hooks/useManagerPatch.ts
import { useCallback, useState } from "react";
import {
  ApiEnvelope,
  ManagerInfo,
  patchManagerInfo,
  normalizeSeatFields,
} from "../apis/getManagerPatch";

type UpdateState = {
  updating: boolean;
  error: string | null;
};

export interface UseManagerPatchOptions {
  token?: string;
  /** seat_type 변경 시 seat_tax_* 필드 정합성 자동 보정 (기본: true) */
  normalizeSeat?: boolean;
}

export function useManagerPatch(options: UseManagerPatchOptions = {}) {
  const [state, setState] = useState<UpdateState>({
    updating: false,
    error: null,
  });

  const update = useCallback(
    async (patch: Partial<ManagerInfo>): Promise<ApiEnvelope<ManagerInfo> | null> => {
      setState({ updating: true, error: null });
      try {
        // 훅에서 보정 여부 결정 (기본 true)
        const shouldNormalize = options.normalizeSeat !== false;
        const payload = shouldNormalize ? normalizeSeatFields(patch) : patch;

        // ✅ token만 전달 (normalizeSeat는 없음)
        const res = await patchManagerInfo(payload, { token: options.token });

        setState({ updating: false, error: null });
        return res;
      } catch (e: any) {
        setState({
          updating: false,
          error: e?.message ?? "운영자 정보를 수정하는 중 오류가 발생했습니다.",
        });
        return null;
      }
    },
    [options.token, options.normalizeSeat]
  );

  return {
    update,
    updating: state.updating,
    error: state.error,
  };
}
