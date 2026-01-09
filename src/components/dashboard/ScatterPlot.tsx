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

function TooltipRow({
  color,
  label,
  value,
}: {
  color: string;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-6 text-sm">
      <div className="flex items-center gap-2">
        <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: color }} />
        <span className="text-muted-foreground">{label}</span>
      </div>
      <span style={{ color }} className="font-medium tabular-nums">
        {value}
      </span>
    </div>
  );
}

function TooltipBox({ active, payload }: any) {
  if (!active || !payload || payload.length === 0) return null;

  const p = payload[0];
  const color = p.color || "hsl(var(--primary) / 0.95)";

  const x = p.payload?.[p.dataKey] ?? p.payload?.expectancy ?? p.payload?.x;
  const y = p.payload?.risk_pct ?? p.payload?.y;

  return (
    <div className="rounded-xl border bg-popover/95 p-3 shadow-sm backdrop-blur text-popover-foreground">
      <div className="space-y-2">
        <TooltipRow color={color} label="Expectancy" value={formatNumber(x)} />
        <TooltipRow color={color} label="Risk %" value={formatNumber(y)} />
      </div>
    </div>
  );
}

export function ScatterPlot({ data, xKey, yKey }: Props) {
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
              // No axis title
            />
            <YAxis
              dataKey={yKey}
              type="number"
              tick={{ fontSize: 12 }}
              width={80}
              tickFormatter={formatNumber}
              // No axis title
            />
            <Tooltip content={<TooltipBox />} />
            <Scatter name="Points" data={data} fill={dot} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
