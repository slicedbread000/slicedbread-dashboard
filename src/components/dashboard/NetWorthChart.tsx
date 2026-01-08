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

function domainFor(data: Point[]): [number, number] | ["auto", "auto"] {
  let min = Infinity;
  let max = -Infinity;

  for (const r of data) {
    const v = r?.networth;
    if (typeof v !== "number" || !Number.isFinite(v)) continue;
    if (v < min) min = v;
    if (v > max) max = v;
  }

  if (!Number.isFinite(min) || !Number.isFinite(max)) return ["auto", "auto"];
  if (min === max) return [min - 1, max + 1];

  const pad = (max - min) * 0.08;
  return [min - pad, max + pad];
}

function formatTick(v: any): string {
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n)) return "";

  const abs = Math.abs(n);
  const decimals =
    abs >= 100000 ? 0 :
    abs >= 1000 ? 0 :
    abs >= 1 ? 2 :
    abs >= 0.01 ? 4 :
    6;

  return n.toLocaleString(undefined, {
    maximumFractionDigits: decimals,
    minimumFractionDigits: 0,
  });
}

export function NetWorthChart({ data }: { data: Point[] }) {
  if (!data || data.length === 0) {
    return <div className="text-sm text-muted-foreground">No net worth data.</div>;
  }

  const domain = domainFor(data);

  return (
    <div className="w-full">
      <div className="w-full aspect-[16/6] min-h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} minTickGap={24} />
            <YAxis
              tick={{ fontSize: 12 }}
              width={80}
              domain={domain as any}
              tickFormatter={formatTick}
            />
            <Tooltip
              formatter={(value: any) => formatTick(value)}
              labelFormatter={(label: any) => String(label)}
            />
            <Line type="monotone" dataKey="networth" dot={false} strokeWidth={2} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
