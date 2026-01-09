"use client";

import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

type Props = {
  data: any[];
  xKey: string;
  yKey: string;

  // Optional: if you ever want labels later, keep these.
  // For your current requirement: do NOT pass them -> no axis titles.
  xLabel?: string;
  yLabel?: string;

  // Optional: tooltip legend labels (defaults to xLabel/yLabel or xKey/yKey)
  xTooltipLabel?: string;
  yTooltipLabel?: string;
};

function num(x: any): number | null {
  const n = typeof x === "number" ? x : Number(String(x ?? "").replace(/[^0-9.\-]/g, ""));
  return Number.isFinite(n) ? n : null;
}

function formatNumber(v: any) {
  const n = num(v);
  if (n === null) return "";
  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: Math.abs(n) < 1 ? 4 : 3,
  }).format(n);
}

function TooltipBox({
  active,
  payload,
  xLabel,
  yLabel,
}: any) {
  if (!active || !payload || payload.length === 0) return null;

  const p = payload[0];
  const color = p.color || "hsl(var(--primary) / 0.95)";

  // Recharts passes the original point in p.payload
  const point = p.payload || {};

  // Prefer explicit keys when present, otherwise fall back to common names
  const x = point?.[p.xKey] ?? point?.expectancy ?? point?.x;
  const y = point?.[p.yKey] ?? point?.risk_pct ?? point?.y;

  return (
    <div className="rounded-xl border bg-popover/95 p-3 shadow-sm backdrop-blur text-popover-foreground">
      <div className="space-y-1 text-sm">
        <div className="flex justify-between gap-6">
          <span className="text-muted-foreground">{xLabel}</span>
          <span style={{ color }} className="font-medium tabular-nums">
            {formatNumber(x)}
          </span>
        </div>
        <div className="flex justify-between gap-6">
          <span className="text-muted-foreground">{yLabel}</span>
          <span style={{ color }} className="font-medium tabular-nums">
            {formatNumber(y)}
          </span>
        </div>
      </div>
    </div>
  );
}

export function ScatterPlot({
  data,
  xKey,
  yKey,
  xLabel,
  yLabel,
  xTooltipLabel,
  yTooltipLabel,
}: Props) {
  if (!data || data.length === 0) {
    return <div className="text-sm text-muted-foreground">No data.</div>;
  }

  const dot = "hsl(var(--primary) / 0.95)";

  // Tooltip legend labels:
  // Use explicit tooltip labels if provided,
  // else use axis labels,
  // else fall back to keys.
  const xTip = xTooltipLabel ?? xLabel ?? xKey;
  const yTip = yTooltipLabel ?? yLabel ?? yKey;

  return (
    <div className="w-full">
      <div className="w-full aspect-[16/6] min-h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" opacity={0.18} />

            <XAxis
              dataKey={xKey}
              type="number"
              tick={{ fontSize: 12 }}
              tickFormatter={formatNumber}
              // Axis titles OFF by default unless you pass xLabel
              label={
                xLabel
                  ? {
                      value: xLabel,
                      position: "insideBottom",
                      offset: -6,
                      fill: "hsl(var(--muted-foreground))",
                    }
                  : undefined
              }
            />

            <YAxis
              dataKey={yKey}
              type="number"
              tick={{ fontSize: 12 }}
              width={80}
              tickFormatter={formatNumber}
              // Axis titles OFF by default unless you pass yLabel
              label={
                yLabel
                  ? {
                      value: yLabel,
                      angle: -90,
                      position: "insideLeft",
                      fill: "hsl(var(--muted-foreground))",
                    }
                  : undefined
              }
            />

            <Tooltip
              content={
                <TooltipBox
                  xLabel={xTip}
                  yLabel={yTip}
                  // pass keys so the tooltip reads the correct fields
                  xKey={xKey}
                  yKey={yKey}
                />
              }
            />

            <Scatter name="Points" data={data} fill={dot} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
