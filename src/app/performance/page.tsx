import { AppShell } from "@/components/layout/AppShell";
import { fetchDashboardData } from "@/lib/dashboardApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EquityChart } from "@/components/dashboard/EquityChart";
import { ColumnChart } from "@/components/dashboard/ColumnChart";

function toNumber(x: any): number {
  if (typeof x === "number") return x;
  const n = Number(String(x ?? "").replace(/[^0-9.\-]/g, ""));
  return Number.isFinite(n) ? n : NaN;
}
function toDate(x: any): Date | null {
  if (!x) return null;
  const d = new Date(String(x).trim());
  return isNaN(d.getTime()) ? null : d;
}
function dedupeSort(points: { d: Date; v: number }[]) {
  points.sort((a, b) => a.d.getTime() - b.d.getTime());
  const byDay = new Map<string, number>();
  for (const p of points) byDay.set(p.d.toISOString().slice(0, 10), p.v);
  return Array.from(byDay.entries()).map(([date, v]) => ({ date, v }));
}
function lineSeries(rows: any[], dateKey: string, valKey: string) {
  const pts = (rows || [])
    .map((r) => {
      const d = toDate(r[dateKey]);
      const v = toNumber(r[valKey]);
      if (!d || !Number.isFinite(v)) return null;
      return { d, v };
    })
    .filter(Boolean) as { d: Date; v: number }[];
  return dedupeSort(pts).map((p) => ({ date: p.date, equity: p.v })).slice(-365);
}
function barSeries(rows: any[], dateKey: string, valKey: string) {
  const pts = (rows || [])
    .map((r) => {
      const d = toDate(r[dateKey]);
      const v = toNumber(r[valKey]);
      if (!d || !Number.isFinite(v)) return null;
      return { d, v };
    })
    .filter(Boolean) as { d: Date; v: number }[];
  return dedupeSort(pts).map((p) => ({ date: p.date, value: p.v })).slice(-365);
}
function latestString(rows: any[], key: string): string | null {
  for (let i = (rows?.length ?? 0) - 1; i >= 0; i--) {
    const v = rows[i]?.[key];
    if (v !== undefined && v !== null && String(v).trim() !== "") return String(v);
  }
  return null;
}

export default async function PerformancePage() {
  const data = await fetchDashboardData();

  const eqRows = (data?.equityCurve?.rows ?? []) as any[];
  const rsRows = (data?.riskState?.rows ?? []) as any[];
  const pfRows = (data?.profitFactor?.rows ?? []) as any[];

  // KPIs (authoritative from Apps Script, which reads Equity_Curve columns directly)
  const kpiCumPnl = data?.kpis?.cumulative_pnl_latest ?? null;
  const kpiDrawdown = data?.kpis?.drawdown_latest ?? null;
  const kpiPf30d = data?.kpis?.pf30d_latest ?? null;
  const kpiWinRate30d = latestString(rsRows, "Win Rate (30d)");

  // Charts you said are accurate:
  const drawdown = lineSeries(eqRows, "date", "drawdown");
  const cumNet30d = lineSeries(pfRows, "Date", "cum_net_30d");

  // Avg net trade (30d) as column chart
  const avgNetTrade30d = barSeries(pfRows, "Date", "avg_net_trade_30d");

  // Rolling Win Rate (30d) from API series (Equity_Curve F + W)
  const rollingWR = ((data?.rollingWinRate30d?.rows ?? []) as any[])
    .map((r) => {
      const d = toDate(r?.date);
      const v = toNumber(r?.value);
      if (!d || !Number.isFinite(v)) return null;
      return { d, v };
    })
    .filter(Boolean) as { d: Date; v: number }[];

  rollingWR.sort((a, b) => a.d.getTime() - b.d.getTime());
  const rollingWRSeries = dedupeSort(rollingWR).map((p) => ({ date: p.date, equity: p.v })).slice(-365);

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <div className="text-xl font-semibold tracking-tight">Performance Summary</div>
          <div className="text-sm text-muted-foreground">
            Last refresh: {data?.meta?.generatedAt ?? "Unknown"}
          </div>
        </div>

        {/* KPI strip */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                Cumulative PnL (latest)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold tracking-tight">{kpiCumPnl ?? "—"}</div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                Drawdown (latest)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold tracking-tight">{kpiDrawdown ?? "—"}</div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">PF (30d)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold tracking-tight">{kpiPf30d ?? "—"}</div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">Win Rate (30d)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold tracking-tight">{kpiWinRate30d ?? "—"}</div>
            </CardContent>
          </Card>
        </div>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Cumulative Net PnL (30d)</CardTitle>
          </CardHeader>
          <CardContent>
            <EquityChart data={cumNet30d} />
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Avg Net per Trade (30d)</CardTitle>
          </CardHeader>
          <CardContent>
            <ColumnChart data={avgNetTrade30d} />
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Rolling Win Rate (30d)</CardTitle>
          </CardHeader>
          <CardContent>
            <EquityChart data={rollingWRSeries} />
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Drawdown</CardTitle>
          </CardHeader>
          <CardContent>
            <EquityChart data={drawdown} />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
