"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

function hsl(varName: string, alpha = 1) {
  return `hsl(var(${varName}) / ${alpha})`;
}

type LineDef = {
  key: string;
  label: string;
  stroke?: string;
  strokeWidth?: number;
  strokeDasharray?: string;
};

function computeDomain(data: any[], keys: string[], pad = 0.06): [number, number] | undefined {
  const vals: number[] = [];
  for (const row of data ?? []) {
    for (const k of keys) {
      const v = Number(row?.[k]);
      if (Number.isFinite(v)) vals.push(v);
    }
  }
  if (vals.length === 0) return undefined;
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  if (min === max) {
    const bump = Math.abs(min || 1) * 0.1;
    return [min - bump, max + bump];
  }
  const range = max - min;
  return [min - range * pad, max + range * pad];
}

export function MultiLineChart({
  data,
  lines,
  curve = "linear",
  yTight = false,
}: {
  data: any[];
  lines: LineDef[];
  curve?: "linear" | "monotone";
  yTight?: boolean;
}) {
  if (!data || data.length === 0) {
    return <div className="text-sm text-muted-foreground">No data.</div>;
  }

  const fallbackStrokes = [
    hsl("--primary", 0.95),
    hsl("--chart-2", 0.95),
    hsl("--chart-3", 0.95),
    hsl("--chart-4", 0.95),
    hsl("--chart-5", 0.95),
  ];

  const domain = yTight ? computeDomain(data, lines.map((l) => l.key)) : undefined;

  return (
    <div className="w-full">
      <div className="w-full aspect-[16/6] min-h-[260px] rounded-xl border border-border/70 bg-card/30 p-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 12, left: 8, bottom: 6 }}>
            <CartesianGrid stroke={hsl("--border", 0.35)} strokeDasharray="3 6" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12, fill: hsl("--muted-foreground", 0.95) }}
              axisLine={{ stroke: hsl("--border", 0.55) }}
              tickLine={{ stroke: hsl("--border", 0.55) }}
              minTickGap={26}
            />
            <YAxis
              tick={{ fontSize: 12, fill: hsl("--muted-foreground", 0.95) }}
              axisLine={{ stroke: hsl("--border", 0.55) }}
              tickLine={{ stroke: hsl("--border", 0.55) }}
              width={84}
              domain={domain as any}
            />
            <Tooltip
              cursor={{ stroke: hsl("--primary", 0.25), strokeWidth: 1 }}
              contentStyle={{
                background: hsl("--card", 0.98),
                border: `1px solid ${hsl("--border", 0.85)}`,
                borderRadius: 12,
                color: hsl("--foreground", 0.98),
                boxShadow: `0 12px 28px ${hsl("--background", 0.45)}`,
              }}
              labelStyle={{ color: hsl("--muted-foreground", 0.95) }}
              itemStyle={{ color: hsl("--foreground", 0.98) }}
            />
            <Legend wrapperStyle={{ color: hsl("--muted-foreground", 0.95), fontSize: 12 }} />

            {lines.map((l, i) => (
              <Line
                key={l.key}
                type={curve}
                dataKey={l.key}
                name={l.label}
                dot={false}
                stroke={l.stroke ?? fallbackStrokes[i % fallbackStrokes.length]}
                strokeWidth={l.strokeWidth ?? 2}
                strokeDasharray={l.strokeDasharray}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
