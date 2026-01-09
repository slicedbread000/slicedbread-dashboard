import { AppShell } from "@/components/layout/AppShell";
import { fetchDashboardData } from "@/lib/dashboardApi";
import { isOk } from "@/lib/typeguards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EquityChart } from "@/components/dashboard/EquityChart";
import { ColumnChart } from "@/components/dashboard/ColumnChart";
import { MultiLineChart } from "@/components/dashboard/MultiLineChart";

type OkShape = {
  meta?: { generatedAt?: string };
  equityCurve?: { rows?: any[] };
  riskState?: { rows?: any[] };
  profitFactor?: { rows?: any[] };
  rollingWinRate30d?: { rows?: any[] };
  kpis?: {
    cumulative_pnl_latest?: any;
    drawdown_latest?: any;
    pf30d_latest?: any;
  };
};

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
      const d = toDate(r?.[dateKey]);
      const v = toNumber(r?.[valKey]);
      if (!d || !Number.isFinite(v)) return null;
      return { d, v };
    })
    .filter(Boolean) as { d: Date; v: number }[];

  return dedupeSort(pts)
    .map((p) => ({ date: p.date, equity: p.v }))
    .slice(-365);
}

function barSeries(rows: any[], dateKey: string, valKey: string) {
  const pts = (rows || [])
    .map((r) => {
      const d = toDate(r?.[dateKey]);
      const v = toNumber(r?.[valKey]);
      if (!d || !Number.isFinite(v)) return null;
      return { d, v };
    })
    .filter(Boolean) as { d: Date; v: number }[];

  return dedupeSort(pts)
    .map((p) => ({ date: p.date, value: p.v }))
    .slice(-365);
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
  const ok = isOk<OkShape>(data);

  const eqRows = (ok ? data.equityCurve?.rows ?? [] : []) as any[];
  const rsRows = (ok ? data.riskState?.rows ?? [] : []) as any[];
  const pfRows = (ok ? data.profitFactor?.rows ?? [] : []) as any[];

  // KPIs (authoritative)
  const kpiCumPnl = ok ? data.kpis?.cumulative_pnl_latest ?? null : null;
  const kpiDrawdown = ok ? data.kpis?.drawdown_latest ?? null : null;
  const kpiPf30d = ok ? data.kpis?.pf30d_latest ?? null : null;
  const kpiWinRate30d = latestString(rsRows, "Win Rate (30d)");

  // Charts
  const drawdown = lineSeries(eqRows, "date", "drawdown"); // {date, equity} where equity = drawdown value
  const cumNet30d = lineSeries(pfRows, "Date", "cum_net_30d");
  const avgNetTrade30d = barSeries(pfRows, "Date", "avg_net_trade_30d");

  // Rolling Win Rate (30d)
  const rollingWR = ((ok ? data.rollingWinRate30d?.rows ?? [] : []) as any[])
    .map((r) => {
      const d = toDate(r?.date);
      const v = toNumber(r?.value);
      if (!d || !Number.isFinite(v)) return null;
      return { d, v };
    })
    .filter(Boolean) as { d: Date; v: number }[];

  rollingWR.sort((a, b) => a.d.getTime() - b.d.getTime());
  const rollingWRSeries = dedupeSort(rollingWR)
    .map((p) => ({ date: p.date, equity: p.v }))
    .slice(-365);

  const subtitle = ok
    ? `Last refresh: ${data.meta?.generatedAt ?? "Unknown"}`
    : `Data error: ${(data as any)?.error ?? "Unknown error"}`;

  // Remap drawdown into MultiLineChart-friendly format
  const drawdownForRed = drawdown.map((p) => ({ date: p.date, drawdown: p.equity }));

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <div className="text-xl font-semibold tracking-tight">Performance Summary</div>
          <div className="text-sm text-muted-foreground">{subtitle}</div>
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
            <ColumnChart data={avgNetTrade30d} mode="posNeg" valueLabel="Avg Net / Trade (30d)" />
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
            <MultiLineChart
              data={drawdownForRed}
              curve="linear"
              yTight
              lines={[
                {
                  key: "drawdown",
                  label: "Drawdown",
                  stroke: "hsl(0 70% 55% / 0.85)",
                  strokeWidth: 2.3,
                },
              ]}
            />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
