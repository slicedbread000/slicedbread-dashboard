"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

type LineDef = {
  key: string;
  label: string;
  stroke: string;
  strokeWidth?: number;
  strokeDasharray?: string;
};

type Props = {
  data: any[];
  lines: LineDef[];
  curve?: "linear" | "monotone";
  yTight?: boolean;
};

function num(x: any): number | null {
  const n = typeof x === "number" ? x : Number(String(x ?? "").replace(/[^0-9.\-]/g, ""));
  return Number.isFinite(n) ? n : null;
}

function formatNumber(v: any) {
  const n = num(v);
  if (n === null) return "";
  // Avoid scientific / huge digit spam, keep it readable
  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: Math.abs(n) < 1 ? 4 : 2,
  }).format(n);
}

function computeDomain(data: any[], keys: string[]) {
  let min = Infinity;
  let max = -Infinity;

  for (const row of data || []) {
    for (const k of keys) {
      const v = num(row?.[k]);
      if (v === null) continue;
      if (v < min) min = v;
      if (v > max) max = v;
    }
  }

  if (!Number.isFinite(min) || !Number.isFinite(max)) return undefined;

  // If flat line, create a sensible range
  if (min === max) {
    const pad = Math.max(1, Math.abs(min) * 0.02);
    return [min - pad, max + pad] as [number, number];
  }

  const range = max - min;
  const pad = range * 0.12; // slightly roomy, still tight
  return [min - pad, max + pad] as [number, number];
}

function TooltipBox({ active, payload, label }: any) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="rounded-xl border bg-popover/95 p-3 shadow-sm backdrop-blur text-popover-foreground">
      <div className="mb-2 text-xs text-muted-foreground">{label}</div>
      <div className="space-y-1">
        {payload.map((p: any) => (
          <div key={p.dataKey} className="flex items-center justify-between gap-6 text-sm">
            <span className="flex items-center gap-2">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ background: p.color }}
              />
              <span className="text-muted-foreground">{p.name}</span>
            </span>
            <span style={{ color: p.color }} className="font-medium tabular-nums">
              {formatNumber(p.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function MultiLineChart({ data, lines, curve = "linear", yTight = false }: Props) {
  if (!data || data.length === 0) {
    return <div className="text-sm text-muted-foreground">No data.</div>;
  }

  const domain = yTight ? computeDomain(data, lines.map((l) => l.key)) : undefined;

  return (
    <div className="w-full">
      <div className="w-full aspect-[16/6] min-h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.18} />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} minTickGap={24} />
            <YAxis
              tick={{ fontSize: 12 }}
              width={80}
              tickFormatter={formatNumber}
              domain={domain as any}
            />
            <Tooltip content={<TooltipBox />} />
            <Legend
              wrapperStyle={{ fontSize: 12 }}
              formatter={(value: any, entry: any) => (
                <span style={{ color: entry?.color ?? "inherit" }}>{value}</span>
              )}
            />
            {lines.map((l) => (
              <Line
                key={l.key}
                type={curve}
                dataKey={l.key}
                name={l.label}
                stroke={l.stroke}
                strokeWidth={l.strokeWidth ?? 2}
                strokeDasharray={l.strokeDasharray}
                dot={false}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
