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
  xLabel?: string;
  yLabel?: string;
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

function TooltipBox({ active, payload }: any) {
  if (!active || !payload || payload.length === 0) return null;
  const p = payload[0];
  const color = p.color;
  const x = p.payload?.expectancy ?? p.payload?.x ?? p.payload?.[p.dataKey];
  const y = p.payload?.risk_pct ?? p.payload?.y;

  return (
    <div className="rounded-xl border bg-popover/95 p-3 shadow-sm backdrop-blur text-popover-foreground">
      <div className="space-y-1 text-sm">
        <div className="flex justify-between gap-6">
          <span className="text-muted-foreground">X</span>
          <span style={{ color }} className="font-medium tabular-nums">
            {formatNumber(x)}
          </span>
        </div>
        <div className="flex justify-between gap-6">
          <span className="text-muted-foreground">Y</span>
          <span style={{ color }} className="font-medium tabular-nums">
            {formatNumber(y)}
          </span>
        </div>
      </div>
    </div>
  );
}

export function ScatterPlot({ data, xKey, yKey, xLabel, yLabel }: Props) {
  if (!data || data.length === 0) {
    return <div className="text-sm text-muted-foreground">No data.</div>;
  }

  const dot = "hsl(var(--primary) / 0.95)";

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
              label={
                xLabel
                  ? { value: xLabel, position: "insideBottom", offset: -6, fill: "hsl(var(--muted-foreground))" }
                  : undefined
              }
            />
            <YAxis
              dataKey={yKey}
              type="number"
              tick={{ fontSize: 12 }}
              width={80}
              tickFormatter={formatNumber}
              label={
                yLabel
                  ? { value: yLabel, angle: -90, position: "insideLeft", fill: "hsl(var(--muted-foreground))" }
                  : undefined
              }
            />
            <Tooltip content={<TooltipBox />} />
            <Scatter name="Points" data={data} fill={dot} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
