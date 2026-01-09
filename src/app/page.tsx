import { AppShell } from "@/components/layout/AppShell";
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

/**
 * Cumulative PnL curve from equityCurve:
 * headers: ["date","daily_net_pnl","cumulative_pnl","drawdown"]
 *
 * We map it into the EquityChart shape { date, equity } by using:
 *   equity := cumulative_pnl
 */
function parseCumulativePnl(rows: any[]): { date: string; equity: number }[] {
  const parsed = (rows || [])
    .map((r) => {
      const d = toDate(r["date"]);
      const cum = toNumber(r["cumulative_pnl"]);
      if (!d || !Number.isFinite(cum)) return null;
      return { d, cum };
    })
    .filter(Boolean) as { d: Date; cum: number }[];

  // sort ascending
  parsed.sort((a, b) => a.d.getTime() - b.d.getTime());

  // de-dupe by day (keep last)
  const byDay = new Map<string, number>();
  for (const p of parsed) {
    const key = p.d.toISOString().slice(0, 10);
    byDay.set(key, p.cum);
  }

  return Array.from(byDay.entries()).map(([date, cum]) => ({
    date,
    equity: cum, // plotted line value
  }));
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

  const subtitle = ok
    ? `Last refresh: ${data.meta?.generatedAt ?? "Unknown"}`
    : `Data error: ${(data as any)?.error ?? "Unknown error"}`;

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <div className="text-xl font-semibold tracking-tight">Overview</div>
          <div className="text-sm text-muted-foreground">{subtitle}</div>
        </div>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Cumulative PnL</CardTitle>
          </CardHeader>
          <CardContent>
            <EquityChart data={cumulativePnlData} />
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Net Worth</CardTitle>
          </CardHeader>
          <CardContent>
            <NetWorthChart data={netWorthData} />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
