import { AppShell } from "@/components/layout/AppShell";
import { fetchDashboardData } from "@/lib/dashboardApi";
import { isOk } from "@/lib/typeguards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MultiLineChart } from "@/components/dashboard/MultiLineChart";
import { ColumnChart } from "@/components/dashboard/ColumnChart";
import { ScatterPlot } from "@/components/dashboard/ScatterPlot";

type OkShape = {
  meta?: { generatedAt?: string };
  riskState?: { rows?: any[] };
  kpis?: { peak_equity_latest?: any };
  edgeExposureRolling?: { edge?: any[]; exposure?: any[] };
  expectancyRiskScatter?: { rows?: any[] };
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
    .map((p) => ({ date: p.date, v: p.v }))
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

export default async function RiskPage() {
  const data = await fetchDashboardData();
  const ok = isOk<OkShape>(data);

  const rsRows = (ok ? data.riskState?.rows ?? [] : []) as any[];

  // KPIs
  const drawdownPct = latestString(rsRows, "drawdown_pct");
  const peakEquity = ok ? data.kpis?.peak_equity_latest ?? null : null;

  // Series
  const riskPct = lineSeries(rsRows, "date", "risk_pct");
  const recovery = lineSeries(rsRows, "date", "recovery_pct");
  const lossStreak = barSeries(rsRows, "date", "loss_streak");

  // Equity curve with risk cut zones
  const zonePts = (rsRows || [])
    .map((r) => {
      const d = toDate(r?.["date"]);
      const equity = toNumber(r?.["equity_usd"]);
      const b3 = toNumber(r?.["band_-3%"]);
      const b45 = toNumber(r?.["band_-4.5%"]);
      const b525 = toNumber(r?.["band_-5.25%"]);
      if (!d || !Number.isFinite(equity)) return null;
      return { d, equity, b3, b45, b525 };
    })
    .filter(Boolean) as { d: Date; equity: number; b3: number; b45: number; b525: number }[];

  zonePts.sort((a, b) => a.d.getTime() - b.d.getTime());

  const zonesByDay = new Map<
    string,
    { equity: number; b3?: number; b45?: number; b525?: number }
  >();

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

  // Edge vs Exposure (Rolling)
  const edgeRows = (ok ? data.edgeExposureRolling?.edge ?? [] : []) as any[];
  const exposureRows = (ok ? data.edgeExposureRolling?.exposure ?? [] : []) as any[];

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

  // Expectancy vs Risk % — scatter
  const scatterRaw = (ok ? data.expectancyRiskScatter?.rows ?? [] : []) as any[];
  const scatterData = scatterRaw
    .map((r) => {
      const x = toNumber(r?.expectancy);
      const y = toNumber(r?.risk_pct);
      if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
      return { expectancy: x, risk_pct: y };
    })
    .filter(Boolean) as any[];

  const subtitle = ok
    ? `Last refresh: ${data.meta?.generatedAt ?? "Unknown"}`
    : `Data error: ${(data as any)?.error ?? "Unknown error"}`;

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <div className="text-xl font-semibold tracking-tight">Risk State</div>
          <div className="text-sm text-muted-foreground">{subtitle}</div>
        </div>

        {/* KPIs */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
          <Card className="rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                Drawdown %
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold tracking-tight">{drawdownPct ?? "—"}</div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                Peak Equity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold tracking-tight">{peakEquity ?? "—"}</div>
            </CardContent>
          </Card>
        </div>

        {/* Equity + bands */}
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">
              Equity Curve with Risk Cut Zones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MultiLineChart
              data={equityWithZones}
              curve="linear"
              yTight
              lines={[
                { key: "equity_usd", label: "Equity", stroke: "hsl(var(--primary) / 0.95)", strokeWidth: 2.6 },
                { key: "band_m3", label: "Band -3%", stroke: "hsl(45 90% 55% / 0.85)", strokeWidth: 1.7, strokeDasharray: "6 4" },    // amber
                { key: "band_m45", label: "Band -4.5%", stroke: "hsl(210 90% 60% / 0.80)", strokeWidth: 1.7, strokeDasharray: "6 4" }, // blue
                { key: "band_m525", label: "Band -5.25%", stroke: "hsl(0 75% 55% / 0.80)", strokeWidth: 1.7, strokeDasharray: "6 4" },  // red
              ]}
            />
          </CardContent>
        </Card>

        {/* Risk % over time */}
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Risk % Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <MultiLineChart
              data={riskPct.map((p) => ({ date: p.date, risk_pct: p.v }))}
              curve="linear"
              yTight
              lines={[
                { key: "risk_pct", label: "Risk %", stroke: "hsl(var(--primary) / 0.95)", strokeWidth: 2.4 },
              ]}
            />
          </CardContent>
        </Card>

        {/* Scatter */}
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Expectancy vs Risk % (Scatter)</CardTitle>
          </CardHeader>
          <CardContent>
            <ScatterPlot
              data={scatterData}
              xKey="expectancy"
              yKey="risk_pct"
            />
          </CardContent>
        </Card>

        {/* Edge vs Exposure */}
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Edge vs Exposure (Rolling)</CardTitle>
          </CardHeader>
          <CardContent>
            <MultiLineChart
              data={edgeExposureRolling}
              curve="linear"
              yTight
              lines={[
                { key: "edge", label: "Edge", stroke: "hsl(var(--primary) / 0.95)", strokeWidth: 2.6 },           // green
                { key: "exposure", label: "Exposure", stroke: "hsl(200 90% 60% / 0.90)", strokeWidth: 2.4 },     // cyan/blue
              ]}
            />
          </CardContent>
        </Card>

        {/* Recovery */}
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Recovery Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <MultiLineChart
              data={recovery.map((p) => ({ date: p.date, recovery_pct: p.v }))}
              curve="linear"
              yTight
              lines={[
                { key: "recovery_pct", label: "Recovery %", stroke: "hsl(var(--primary) / 0.95)", strokeWidth: 2.4 },
              ]}
            />
          </CardContent>
        </Card>

        {/* Losses */}
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Consecutive Losses</CardTitle>
          </CardHeader>
          <CardContent>
            <ColumnChart data={lossStreak} mode="lossOnly" valueLabel="Consecutive Losses" />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
