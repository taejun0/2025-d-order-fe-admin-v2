// src/pages/liveorder_v2/hooks/useMenuData.ts

import { useEffect } from "react";
import { useLiveOrderStore } from "../LiveOrderStore";
import { getMenuNames } from "../services/LiveOrderServiceV2"; // API 파일 경로에 맞게 수정

export const useMenuData = () => {
  const { setMenuList } = useLiveOrderStore();

  useEffect(() => {
    const fetchMenuData = async () => {
      try {
        const menuNames = await getMenuNames();
        setMenuList(menuNames);
      } catch (error) {
        console.error("메뉴 목록 로딩 실패:", error);
      }
    };

    fetchMenuData();
  }, [setMenuList]);
};
