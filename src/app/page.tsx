import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { fetchDashboardData } from "@/lib/dashboardApi";
import { isOk } from "@/lib/typeguards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EquityChart } from "@/components/dashboard/EquityChart";
import { NetWorthChart } from "@/components/dashboard/NetWorthChart";

type OkShape = {
  meta?: { generatedAt?: string };
  equityCurve?: { rows?: any[] };
  netWorth?: { rows?: any[] };
};

function toNumber(x: any): number {
  if (typeof x === "number") return x;
  const n = Number(String(x ?? "").replace(/[^0-9.\-]/g, ""));
  return Number.isFinite(n) ? n : NaN;
}

function toDate(x: any): Date | null {
  if (!x) return null;
  const s = String(x).trim();
  const d = new Date(s);
  if (!isNaN(d.getTime())) return d;
  return null;
}

function formatCurrencyUSD(v: any, decimals = 0) {
  const n = toNumber(v);
  if (!Number.isFinite(n)) return "";
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: decimals,
  }).format(n);
}

function parseCumulativePnl(rows: any[]): { date: string; equity: number }[] {
  const parsed = (rows || [])
    .map((r) => {
      const d = toDate(r["date"]);
      const cum = toNumber(r["cumulative_pnl"]);
      if (!d || !Number.isFinite(cum)) return null;
      return { d, cum };
    })
    .filter(Boolean) as { d: Date; cum: number }[];

  parsed.sort((a, b) => a.d.getTime() - b.d.getTime());

  const byDay = new Map<string, number>();
  for (const p of parsed) {
    const key = p.d.toISOString().slice(0, 10);
    byDay.set(key, p.cum);
  }

  return Array.from(byDay.entries()).map(([date, cum]) => ({ date, equity: cum }));
}

function parseNetWorth(rows: any[]): { date: string; networth: number }[] {
  const parsed = (rows || [])
    .map((r) => {
      const d = toDate(r["date_utc"]);
      const networth = toNumber(r["networth_usd"]);
      if (!d || !Number.isFinite(networth)) return null;
      return { d, networth };
    })
    .filter(Boolean) as { d: Date; networth: number }[];

  parsed.sort((a, b) => a.d.getTime() - b.d.getTime());

  const byDay = new Map<string, number>();
  for (const p of parsed) {
    const key = p.d.toISOString().slice(0, 10);
    byDay.set(key, p.networth);
  }

  return Array.from(byDay.entries()).map(([date, networth]) => ({ date, networth }));
}

export default async function Home() {
  const data = await fetchDashboardData();
  const ok = isOk<OkShape>(data);

  const cumulativePnlData = parseCumulativePnl(ok ? (data.equityCurve?.rows ?? []) : []).slice(-365);
  const netWorthData = parseNetWorth(ok ? (data.netWorth?.rows ?? []) : []).slice(-365);

  const refreshAt = ok ? (data.meta?.generatedAt ?? null) : null;
  const status = ok ? "ok" : "error";
  const subtitle = ok ? "System overview and capital trajectory." : `Data error: ${(data as any)?.error ?? "Unknown error"}`;
  const pillText = refreshAt ? `Last refresh: ${refreshAt}` : undefined;

  const usd0 = (v: any) => formatCurrencyUSD(v, 0);

  return (
    <AppShell>
      <PageHeader title="Command Center" subtitle={subtitle} status={status} pillText={pillText} />

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Cumulative PnL</CardTitle>
        </CardHeader>
        <CardContent>
          <EquityChart data={cumulativePnlData} name="Cumulative PnL" format="currency" />
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Net Worth</CardTitle>
        </CardHeader>
        <CardContent>
          <NetWorthChart data={netWorthData} format="currency" />
        </CardContent>
      </Card>
    </AppShell>
  );
}
