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

function niceDomain(values: number[], pad = 0.06): [number, number] {
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

export function ScatterPlot({
  data,
  xKey,
  yKey,
  xLabel,
  yLabel,
  xTickFormat,
  yTickFormat,
}: {
  data: any[];
  xKey: string;
  yKey: string;
  xLabel?: string;
  yLabel?: string;
  xTickFormat?: (v: any) => string;
  yTickFormat?: (v: any) => string;
}) {
  if (!data || data.length === 0) {
    return <div className="text-sm text-muted-foreground">No data.</div>;
  }

  const xs = data.map((d) => Number(d?.[xKey])).filter(Number.isFinite);
  const ys = data.map((d) => Number(d?.[yKey])).filter(Number.isFinite);

  const [xMin, xMax] = niceDomain(xs);
  const [yMin, yMax] = niceDomain(ys);

  const fmtDefault = (v: any) => {
    const n = Number(v);
    if (!Number.isFinite(n)) return String(v ?? "");
    // Keep axis clean (prevents the repeated "1" look)
    if (Math.abs(n) >= 1) return n.toFixed(2);
    return n.toFixed(3);
  };

  return (
    <div className="w-full">
      <div className="w-full aspect-[16/6] min-h-[260px] rounded-xl border border-border/70 bg-card/30 p-2">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 10, right: 16, left: 10, bottom: 10 }}>
            <CartesianGrid stroke={hsl("--border", 0.35)} strokeDasharray="3 6" />

            <XAxis
              type="number"
              dataKey={xKey}
              domain={[xMin, xMax]}
              tick={{ fontSize: 12, fill: hsl("--muted-foreground", 0.95) }}
              axisLine={{ stroke: hsl("--border", 0.55) }}
              tickLine={{ stroke: hsl("--border", 0.55) }}
              tickFormatter={xTickFormat ?? fmtDefault}
              label={
                xLabel
                  ? { value: xLabel, position: "insideBottom", offset: -4, fill: hsl("--muted-foreground", 0.9), fontSize: 12 }
                  : undefined
              }
            />

            <YAxis
              type="number"
              dataKey={yKey}
              domain={[yMin, yMax]}
              tick={{ fontSize: 12, fill: hsl("--muted-foreground", 0.95) }}
              axisLine={{ stroke: hsl("--border", 0.55) }}
              tickLine={{ stroke: hsl("--border", 0.55) }}
              width={84}
              tickFormatter={yTickFormat ?? fmtDefault}
              label={
                yLabel
                  ? { value: yLabel, angle: -90, position: "insideLeft", fill: hsl("--muted-foreground", 0.9), fontSize: 12 }
                  : undefined
              }
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

            <Scatter data={data} fill={hsl("--primary", 0.75)} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
