import { useState, useEffect, useCallback, useMemo } from 'react';
import DummyLiveOrderService, {
  Order,
  OrderItem,
} from '../dummy/DummyLiveOrderService';

const CurrentLiveOrderService = DummyLiveOrderService;

const convertApiDataToUiFormat = (apiData: Order[]): OrderItem[] => {
  return apiData.map((item) => ({
    id: item.id,
    time: new Date(item.created_at).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    }),
    table: `테이블 ${item.table_num}`,
    menu: item.menu_name,
    quantity: item.menu_num,
    isServed: item.order_status === 'served_complete',
    imageUrl: item.menu_image,
  }));
};

export const useLiveOrdersData = () => {
  const [allOrders, setAllOrders] = useState<OrderItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const [fadingIds, setFadingIds] = useState<Set<number>>(new Set());
  const [fadingTables, setFadingTables] = useState<Set<string>>(new Set());

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await CurrentLiveOrderService.getOrders();
      setAllOrders(convertApiDataToUiFormat(response.data.orders));
      setLastUpdated(new Date());
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleServeOrder = useCallback(
    async (orderId: number) => {
      await CurrentLiveOrderService.updateOrderStatus(orderId);

      const targetOrder = allOrders.find((o) => o.id === orderId);
      if (!targetOrder) return;

      const currentTable = targetOrder.table;

      const updatedOrders = allOrders.map((o) =>
        o.id === orderId ? { ...o, isServed: true } : o
      );

      setAllOrders(updatedOrders);

      const tableOrders = updatedOrders.filter((o) => o.table === currentTable);
      const allServed = tableOrders.every((o) => o.isServed);

      if (allServed) {
        // 테이블 단위 fade-out
        setFadingTables((prev) => new Set(prev).add(currentTable));

        setTimeout(() => {
          setFadingTables((prev) => {
            const next = new Set(prev);
            next.delete(currentTable);
            return next;
          });

          setAllOrders((prev) => prev.filter((o) => o.table !== currentTable));
        }, 2000);
      } else {
        // 개별 주문 fade-out (💥 무조건 실행되도록!)
        setFadingIds((prev) => new Set(prev).add(orderId));

        setTimeout(() => {
          setFadingIds((prev) => {
            const next = new Set(prev);
            next.delete(orderId);
            return next;
          });

          setAllOrders((prev) => prev.filter((o) => o.id !== orderId));
        }, 2000);
      }
    },
    [allOrders]
  );

  const ordersForMenuList = useMemo(() => {
    return allOrders.filter((o) => !o.isServed || fadingIds.has(o.id));
  }, [allOrders, fadingIds]);

  const tableOrdersForTableList = useMemo(() => {
    const grouped: Record<string, OrderItem[]> = {};
    allOrders.forEach((o) => {
      const shouldShow =
        !o.isServed || fadingIds.has(o.id) || fadingTables.has(o.table);
      if (shouldShow) {
        if (!grouped[o.table]) grouped[o.table] = [];
        grouped[o.table].push(o);
      }
    });
    return grouped;
  }, [allOrders, fadingIds, fadingTables]);

  const getEarliestOrderTime = useCallback((orders: OrderItem[]) => {
    return orders[0]?.time ?? '';
  }, []);

  return {
    orders: ordersForMenuList,
    tableOrders: tableOrdersForTableList,
    isLoading,
    lastUpdated: lastUpdated.toLocaleTimeString(),
    fetchOrders,
    handleServeOrder,
    getFadingMenuItemStatus: (id: number) => fadingIds.has(id),
    getFadingTableBillStatus: (table: string) => fadingTables.has(table),
    getEarliestOrderTime,
  };
};
