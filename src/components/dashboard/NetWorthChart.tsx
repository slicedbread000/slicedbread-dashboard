"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

type Point = { date: string; networth: number };

function num(x: any): number | null {
  const n = typeof x === "number" ? x : Number(String(x ?? "").replace(/[^0-9.\-]/g, ""));
  return Number.isFinite(n) ? n : null;
}

function formatNumber(v: any) {
  const n = num(v);
  if (n === null) return "";
  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: Math.abs(n) < 1 ? 4 : 2,
  }).format(n);
}

function domainTight(data: Point[]) {
  let min = Infinity;
  let max = -Infinity;
  for (const p of data || []) {
    const v = num(p.networth);
    if (v === null) continue;
    min = Math.min(min, v);
    max = Math.max(max, v);
  }
  if (!Number.isFinite(min) || !Number.isFinite(max)) return undefined;
  if (min === max) {
    const pad = Math.max(1, Math.abs(min) * 0.02);
    return [min - pad, max + pad] as [number, number];
  }
  const range = max - min;
  const pad = range * 0.12;
  return [min - pad, max + pad] as [number, number];
}

function TooltipBox({ active, payload, label }: any) {
  if (!active || !payload || payload.length === 0) return null;
  const p = payload[0];
  const color = p.color;

  return (
    <div className="rounded-xl border bg-popover/95 p-3 shadow-sm backdrop-blur text-popover-foreground">
      <div className="mb-2 text-xs text-muted-foreground">{label}</div>
      <div className="flex items-center justify-between gap-6 text-sm">
        <span className="text-muted-foreground">Net Worth</span>
        <span style={{ color }} className="font-medium tabular-nums">
          {formatNumber(p.value)}
        </span>
      </div>
    </div>
  );
}

export function NetWorthChart({ data }: { data: Point[] }) {
  if (!data || data.length === 0) {
    return <div className="text-sm text-muted-foreground">No net worth data.</div>;
  }

  const dom = domainTight(data);

  return (
    <div className="w-full">
      <div className="w-full aspect-[16/6] min-h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.18} />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} minTickGap={24} />
            <YAxis tick={{ fontSize: 12 }} width={80} tickFormatter={formatNumber} domain={dom as any} />
            <Tooltip content={<TooltipBox />} />
            <Line
              type="monotone"
              dataKey="networth"
              dot={false}
              strokeWidth={2.4}
              stroke="hsl(var(--primary) / 0.95)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
