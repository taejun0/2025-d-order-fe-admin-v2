// tableView/TableListTestPage.tsx
import { useMemo } from "react";
import styled from "styled-components";
import { useTableList } from "./_hooks/useTableList";

const Page = styled.div`
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;
const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
`;
const Badge = styled.span<{ $variant?: "ok" | "warn" | "error" }>`
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  color: white;
  background: ${({ $variant }) =>
    $variant === "ok" ? "#16a34a" : $variant === "warn" ? "#f59e0b" : "#ef4444"};
`;
const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 12px;
`;
const Card = styled.div`
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 14px;
`;
const Title = styled.div`
  font-weight: 700;
  font-size: 16px;
`;
const Sub = styled.div`
  font-size: 12px;
  color: #6b7280;
`;
const Button = styled.button`
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #d1d5db;
  background: white;
  cursor: pointer;
  &:hover {
    background: #f9fafb;
  }
`;

function fmtDate(s: string | null) {
  if (!s) return "-";
  try {
    const d = new Date(s);
    if (Number.isNaN(d.getTime())) return s;
    return d.toLocaleString();
  } catch {
    return s;
  }
}

export default function TableListTestPage() {
  // ✅ instance가 Authorization을 자동 주입하므로 토큰 직접 읽지 않음
  const { loading, error, tables, refetch, activateCount, totalRevenue } = useTableList();

  const statusBadge = useMemo(() => {
    if (loading) return <Badge $variant="warn">Loading...</Badge>;
    if (error) return <Badge $variant="error">Error: {error}</Badge>;
    return <Badge $variant="ok">OK</Badge>;
  }, [loading, error]);

  // 디버깅에 도움: baseURL/토큰 유무 간단 노출(원하면 제거 가능)
  const baseURL = String(import.meta.env.VITE_BASE_URL || "").replace(/\/+$/, "");
  const hasToken = !!localStorage.getItem("accessToken");

  return (
    <Page>
      <Row>
        <Title>Table List API Test</Title>
        {statusBadge}
        <Button onClick={refetch}>Refetch</Button>
      </Row>

      <Row>
        <Sub>활성 테이블: {activateCount}개</Sub>
        <Sub>총 매출(누적): {totalRevenue.toLocaleString()}원</Sub>
        <Sub>테이블 수: {tables.length}개</Sub>
      </Row>

      <Row>
        <Sub>baseURL: {baseURL}</Sub>
        <Sub>accessToken: {hasToken ? "있음" : "없음"}</Sub>
      </Row>

      {error && (
        <div style={{ color: "#b91c1c" }}>
          • 에러가 발생했습니다. 콘솔을 확인하세요.
        </div>
      )}

      <CardGrid>
        {tables.map((t) => (
          <Card key={t.tableNum}>
            <Row>
              <Title>Table #{t.tableNum}</Title>
              <Badge
                $variant={
                  t.status === "activate" ? "ok" : t.status === "out" ? "warn" : "error"
                }
              >
                {t.status}
              </Badge>
            </Row>
            <Sub>누적 합계: {t.amount.toLocaleString()}원</Sub>
            <Sub>최근 주문시각: {fmtDate(t.createdAt)}</Sub>
            <div style={{ marginTop: 8 }}>
              <strong>최신 주문(최대 3):</strong>
              {t.latestOrders.length === 0 ? (
                <div className="muted">없음</div>
              ) : (
                <ul style={{ margin: "6px 0 0 16px" }}>
                  {t.latestOrders.map((o, idx) => (
                    <li key={idx}>
                      {o.name} × {o.qty}
                      {typeof o.price === "number"
                        ? ` / ${o.price.toLocaleString()}원`
                        : ""}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Card>
        ))}
      </CardGrid>
    </Page>
  );
}
