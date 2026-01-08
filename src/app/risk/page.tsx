import { AppShell } from "@/components/layout/AppShell";
import { fetchDashboardData } from "@/lib/dashboardApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EquityChart } from "@/components/dashboard/EquityChart";
import { MultiLineChart } from "@/components/dashboard/MultiLineChart";
import { ColumnChart } from "@/components/dashboard/ColumnChart";
import { ScatterPlot } from "@/components/dashboard/ScatterPlot";

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

export default async function RiskPage() {
  const data = await fetchDashboardData();
  const rsRows = (data?.riskState?.rows ?? []) as any[];

  // KPIs (already perfect)
  const drawdownPct = latestString(rsRows, "drawdown_pct");
  const peakEquity = data?.kpis?.peak_equity_latest ?? null;

  // Perfect charts (keep)
  const riskPct = lineSeries(rsRows, "date", "risk_pct");
  const recovery = lineSeries(rsRows, "date", "recovery_pct");
  const lossStreak = barSeries(rsRows, "date", "loss_streak");

  // Equity curve with risk cut zones (values correct; improve styling)
  const zonePts = (rsRows || [])
    .map((r) => {
      const d = toDate(r["date"]);
      const equity = toNumber(r["equity_usd"]);
      const b3 = toNumber(r["band_-3%"]);
      const b45 = toNumber(r["band_-4.5%"]);
      const b525 = toNumber(r["band_-5.25%"]);
      if (!d || !Number.isFinite(equity)) return null;
      return { d, equity, b3, b45, b525 };
    })
    .filter(Boolean) as { d: Date; equity: number; b3: number; b45: number; b525: number }[];

  zonePts.sort((a, b) => a.d.getTime() - b.d.getTime());
  const zonesByDay = new Map<string, { equity: number; b3?: number; b45?: number; b525?: number }>();
  for (const p of zonePts) {
    const key = p.d.toISOString().slice(0, 10);
    zonesByDay.set(key, {
      equity: p.equity,
      b3: Number.isFinite(p.b3) ? p.b3 : undefined,
      b45: Number.isFinite(p.b45) ? p.b45 : undefined,
      b525: Number.isFinite(p.b525) ? p.b525 : undefined,
    });
  }

  const equityWithZones = Array.from(zonesByDay.entries())
    .map(([date, v]) => ({
      date,
      equity_usd: v.equity,
      band_m3: v.b3 ?? null,
      band_m45: v.b45 ?? null,
      band_m525: v.b525 ?? null,
    }))
    .slice(-365);

  // Edge vs Exposure (Rolling) — accurate; make it non-smooth
  const edgeRows = (data?.edgeExposureRolling?.edge ?? []) as any[];
  const exposureRows = (data?.edgeExposureRolling?.exposure ?? []) as any[];

  const edgeMap = new Map<string, number>();
  for (const r of edgeRows) {
    const d = toDate(r?.date);
    const v = toNumber(r?.value);
    if (!d || !Number.isFinite(v)) continue;
    edgeMap.set(d.toISOString().slice(0, 10), v);
  }

  const exposureMap = new Map<string, number>();
  for (const r of exposureRows) {
    const d = toDate(r?.date);
    const v = toNumber(r?.value);
    if (!d || !Number.isFinite(v)) continue;
    exposureMap.set(d.toISOString().slice(0, 10), v);
  }

  const edgeExposureRolling = Array.from(new Set([...edgeMap.keys(), ...exposureMap.keys()]))
    .sort()
    .map((date) => ({
      date,
      edge: edgeMap.get(date) ?? null,
      exposure: exposureMap.get(date) ?? null,
    }))
    .filter((p) => p.edge !== null && p.exposure !== null)
    .slice(-365);

  // Expectancy vs Risk % — SCATTER from Equity_Curve X:Y
  const scatterRaw = (data?.expectancyRiskScatter?.rows ?? []) as any[];
  const scatterData = scatterRaw
    .map((r) => {
      const x = toNumber(r?.expectancy);
      const y = toNumber(r?.risk_pct);
      if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
      return { expectancy: x, risk_pct: y };
    })
    .filter(Boolean) as any[];

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <div className="text-xl font-semibold tracking-tight">Risk State</div>
          <div className="text-sm text-muted-foreground">
            Last refresh: {data?.meta?.generatedAt ?? "Unknown"}
          </div>
        </div>

        {/* KPIs */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
          <Card className="rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">Drawdown %</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold tracking-tight">{drawdownPct ?? "—"}</div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">Peak Equity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold tracking-tight">{peakEquity ?? "—"}</div>
            </CardContent>
          </Card>
        </div>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Equity Curve with Risk Cut Zones</CardTitle>
          </CardHeader>
          <CardContent>
            <MultiLineChart
              data={equityWithZones}
              curve="linear"
              lines={[
                { key: "equity_usd", label: "Equity", stroke: "#111827", strokeWidth: 2 },
                { key: "band_m3", label: "Band -3%", stroke: "#9CA3AF", strokeWidth: 1, strokeDasharray: "6 4" },
                { key: "band_m45", label: "Band -4.5%", stroke: "#6B7280", strokeWidth: 1, strokeDasharray: "6 4" },
                { key: "band_m525", label: "Band -5.25%", stroke: "#4B5563", strokeWidth: 1, strokeDasharray: "6 4" },
              ]}
            />
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Risk % Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <EquityChart data={riskPct} />
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Expectancy vs Risk % (Scatter)</CardTitle>
          </CardHeader>
          <CardContent>
            <ScatterPlot data={scatterData} xKey="expectancy" yKey="risk_pct" />
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Edge vs Exposure (Rolling)</CardTitle>
          </CardHeader>
          <CardContent>
            <MultiLineChart
              data={edgeExposureRolling}
              curve="linear"
              lines={[
                { key: "edge", label: "Edge", stroke: "#111827", strokeWidth: 2 },
                { key: "exposure", label: "Exposure", stroke: "#6B7280", strokeWidth: 2 },
              ]}
            />
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Recovery Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <EquityChart data={recovery} />
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Consecutive Losses</CardTitle>
          </CardHeader>
          <CardContent>
            <ColumnChart data={lossStreak} />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
