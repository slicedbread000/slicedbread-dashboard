import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { fetchDashboardData } from "@/lib/dashboardApi";
import { isOk } from "@/lib/typeguards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EquityChart } from "@/components/dashboard/EquityChart";
import { ColumnChart } from "@/components/dashboard/ColumnChart";

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

  return dedupeSort(pts).map((p) => ({ date: p.date, equity: p.v })).slice(-365);
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

  return dedupeSort(pts).map((p) => ({ date: p.date, value: p.v })).slice(-365);
}

function latestAny(rows: any[], key: string): any {
  for (let i = (rows?.length ?? 0) - 1; i >= 0; i--) {
    const v = rows[i]?.[key];
    if (v !== undefined && v !== null && String(v).trim() !== "") return v;
  }
  return null;
}

function fmtCurrency(v: any) {
  const n = toNumber(v);
  if (!Number.isFinite(n)) return v ?? "—";
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

function fmtNumber(v: any) {
  const n = toNumber(v);
  if (!Number.isFinite(n)) return v ?? "—";
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(n);
}

function fmtPercentFromMaybeFraction(v: any) {
  const n = toNumber(v);
  if (!Number.isFinite(n)) return v ?? "—";
  const pct = Math.abs(n) <= 1 ? n * 100 : n; // 0.19 -> 19
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(pct) + "%";
}

export default async function PerformancePage() {
  const data = await fetchDashboardData();
  const ok = isOk<OkShape>(data);

  const eqRows = (ok ? data.equityCurve?.rows ?? [] : []) as any[];
  const rsRows = (ok ? data.riskState?.rows ?? [] : []) as any[];
  const pfRows = (ok ? data.profitFactor?.rows ?? [] : []) as any[];

  const subtitle = ok
    ? `Last refresh: ${data.meta?.generatedAt ?? "Unknown"}`
    : `Data error: ${(data as any)?.error ?? "Unknown error"}`;

  // KPI raw values
  const kpiCumPnlRaw = ok ? data.kpis?.cumulative_pnl_latest ?? null : null;
  const kpiDrawdownRaw = ok ? data.kpis?.drawdown_latest ?? null : null;
  const kpiPf30dRaw = ok ? data.kpis?.pf30d_latest ?? null : null;
  const kpiWinRate30dRaw = latestAny(rsRows, "Win Rate (30d)");

  // KPI intents
  const cumPnlN = toNumber(kpiCumPnlRaw);
  const drawdownN = toNumber(kpiDrawdownRaw);
  const pfN = toNumber(kpiPf30dRaw);
  const wrN = toNumber(kpiWinRate30dRaw);

  const cumPnlIntent = Number.isFinite(cumPnlN) ? (cumPnlN > 0 ? "good" : cumPnlN < 0 ? "bad" : "neutral") : "neutral";
  const drawdownIntent = Number.isFinite(drawdownN) ? (drawdownN < 0 ? "bad" : drawdownN > 0 ? "good" : "neutral") : "neutral";
  const pfIntent = Number.isFinite(pfN) ? (pfN >= 1.2 ? "good" : pfN >= 1.0 ? "neutral" : "bad") : "neutral";
  const wrPct = Number.isFinite(wrN) ? (Math.abs(wrN) <= 1 ? wrN * 100 : wrN) : NaN;
  const wrIntent = Number.isFinite(wrPct) ? (wrPct >= 55 ? "good" : wrPct >= 45 ? "neutral" : "bad") : "neutral";

  // Charts
  const cumulativeNet30d = lineSeries(pfRows, "Date", "cum_net_30d");

  const rollingWinRate30d = (ok ? data.rollingWinRate30d?.rows ?? [] : [])
    .map((r: any) => {
      const d = toDate(r?.date);
      const v = toNumber(r?.value);
      if (!d || !Number.isFinite(v)) return null;
      return { d, v };
    })
    .filter(Boolean) as { d: Date; v: number }[];

  rollingWinRate30d.sort((a, b) => a.d.getTime() - b.d.getTime());
  const rollingWRSeries = dedupeSort(rollingWinRate30d)
    .map((p) => ({ date: p.date, equity: p.v }))
    .slice(-365);

  const drawdown = lineSeries(eqRows, "date", "drawdown");
  const avgNetTrade30d = barSeries(pfRows, "Date", "avg_net_trade_30d");

  return (
    <AppShell>
      <PageHeader title="Performance Summary" subtitle={subtitle} />

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Cumulative PnL (latest)"
          value={fmtCurrency(kpiCumPnlRaw)}
          intent={cumPnlIntent as any}
        />
        <KpiCard
          label="Drawdown (latest)"
          value={fmtCurrency(kpiDrawdownRaw)}
          intent={drawdownIntent as any}
        />
        <KpiCard
          label="PF (30d)"
          value={fmtNumber(kpiPf30dRaw)}
          intent={pfIntent as any}
        />
        <KpiCard
          label="Win Rate (30d)"
          value={fmtPercentFromMaybeFraction(kpiWinRate30dRaw)}
          intent={wrIntent as any}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="rounded-2xl border-border/70 bg-card/40 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold">Cumulative Net PnL (30d)</CardTitle>
            <span className="text-[11px] text-muted-foreground">365d</span>
          </CardHeader>
          <CardContent>
            <EquityChart data={cumulativeNet30d} name="Cumulative Net PnL (30d)" />
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/70 bg-card/40 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold">Rolling Win Rate (30d)</CardTitle>
            <span className="text-[11px] text-muted-foreground">365d</span>
          </CardHeader>
          <CardContent>
            <EquityChart data={rollingWRSeries} name="Rolling Win Rate (30d)" />
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/70 bg-card/40 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold">Avg Net per Trade (30d)</CardTitle>
            <span className="text-[11px] text-muted-foreground">365d</span>
          </CardHeader>
          <CardContent>
            <ColumnChart data={avgNetTrade30d} mode="profitLoss" name="Avg Net / Trade (30d)" />
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/70 bg-card/40 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold">Drawdown</CardTitle>
            <span className="text-[11px] text-muted-foreground">365d</span>
          </CardHeader>
          <CardContent>
            <EquityChart
              data={drawdown}
              name="Drawdown"
              stroke="hsl(0 75% 55% / 0.95)"
            />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
