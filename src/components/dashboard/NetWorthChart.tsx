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

function hsl(varName: string, alpha = 1) {
  return `hsl(var(${varName}) / ${alpha})`;
}

function domainFromData(values: number[], pad = 0.06): [number, number] {
  const v = values.filter((x) => Number.isFinite(x));
  if (v.length === 0) return [0, 1];
  const min = Math.min(...v);
  const max = Math.max(...v);
  if (min === max) {
    const bump = Math.abs(min || 1) * 0.1;
    return [min - bump, max + bump];
  }
  const range = max - min;
  return [min - range * pad, max + range * pad];
}

export function NetWorthChart({ data }: { data: Point[] }) {
  if (!data || data.length === 0) {
    return <div className="text-sm text-muted-foreground">No net worth data.</div>;
  }

  const ys = data.map((d) => Number(d.networth)).filter(Number.isFinite);
  const domain = domainFromData(ys, 0.08);

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
            <Line
              type="linear"
              dataKey="networth"
              dot={false}
              stroke={hsl("--primary", 0.95)}
              strokeWidth={2.25}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
