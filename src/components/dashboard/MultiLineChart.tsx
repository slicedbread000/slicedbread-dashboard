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

export type MultiLinePoint = Record<string, any> & { date: string };

function yDomainFor(
  data: MultiLinePoint[],
  keys: string[]
): [number, number] | ["auto", "auto"] {
  let min = Infinity;
  let max = -Infinity;

  for (const row of data) {
    for (const k of keys) {
      const v = row?.[k];
      if (typeof v !== "number" || !Number.isFinite(v)) continue;
      if (v < min) min = v;
      if (v > max) max = v;
    }
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

  // avoid ugly floating point tails like 89.99999999999999
  const decimals =
    abs >= 1000 ? 0 :
    abs >= 1 ? 2 :
    abs >= 0.01 ? 4 :
    6;

  return n.toLocaleString(undefined, {
    maximumFractionDigits: decimals,
    minimumFractionDigits: 0,
  });
}

export function MultiLineChart({
  data,
  lines,
  curve = "monotone",
  tightYAxis = true,
}: {
  data: MultiLinePoint[];
  lines: {
    key: string;
    label: string;
    stroke?: string;
    strokeWidth?: number;
    strokeDasharray?: string;
    dot?: boolean;
  }[];
  curve?: "monotone" | "linear";
  tightYAxis?: boolean;
}) {
  if (!data || data.length === 0) {
    return <div className="text-sm text-muted-foreground">No data.</div>;
  }

  const keys = lines.map((l) => l.key);
  const domain = tightYAxis ? yDomainFor(data, keys) : ["auto", "auto"];

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
            {lines.map((l) => (
              <Line
                key={l.key}
                type={curve}
                dataKey={l.key}
                name={l.label}
                dot={l.dot ?? false}
                strokeWidth={l.strokeWidth ?? 2}
                stroke={l.stroke}
                strokeDasharray={l.strokeDasharray}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
