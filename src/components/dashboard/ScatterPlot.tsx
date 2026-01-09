"use client";

import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

function hsl(varName: string, alpha = 1) {
  return `hsl(var(${varName}) / ${alpha})`;
}

export function ScatterPlot({
  data,
  xKey,
  yKey,
}: {
  data: any[];
  xKey: string;
  yKey: string;
}) {
  if (!data || data.length === 0) {
    return <div className="text-sm text-muted-foreground">No data.</div>;
  }

  return (
    <div className="w-full">
      <div className="w-full aspect-[16/6] min-h-[260px] rounded-xl border border-border/70 bg-card/30 p-2">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 8, right: 12, left: 8, bottom: 6 }}>
            <CartesianGrid stroke={hsl("--border", 0.35)} strokeDasharray="3 6" />
            <XAxis
              dataKey={xKey}
              tick={{ fontSize: 12, fill: hsl("--muted-foreground", 0.9) }}
              axisLine={{ stroke: hsl("--border", 0.5) }}
              tickLine={{ stroke: hsl("--border", 0.5) }}
            />
            <YAxis
              dataKey={yKey}
              tick={{ fontSize: 12, fill: hsl("--muted-foreground", 0.9) }}
              axisLine={{ stroke: hsl("--border", 0.5) }}
              tickLine={{ stroke: hsl("--border", 0.5) }}
              width={84}
            />
            <Tooltip
              contentStyle={{
                background: hsl("--card", 0.9),
                border: `1px solid ${hsl("--border", 0.7)}`,
                borderRadius: 12,
                color: hsl("--foreground", 0.95),
              }}
              labelStyle={{ color: hsl("--muted-foreground", 0.95) }}
            />
            <Scatter data={data} fill={hsl("--primary", 0.7)} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
