"use client";

import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

type Props = {
  data: any[];
  xKey: string;
  yKey: string;

  // keep for optional future axis titles (you currently want them OFF)
  xLabel?: string;
  yLabel?: string;

  // tooltip labels (legend-style)
  xTooltipLabel?: string;
  yTooltipLabel?: string;

  // legend label for the series
  seriesLabel?: string;
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
        <span
          className="inline-block h-2.5 w-2.5 rounded-full"
          style={{ background: color }}
        />
        <span className="text-muted-foreground">{label}</span>
      </div>
      <span className="font-medium tabular-nums" style={{ color }}>
        {value}
      </span>
    </div>
  );
}

function TooltipBox({
  active,
  payload,
  xKey,
  yKey,
  xLabel,
  yLabel,
}: any) {
  if (!active || !payload || payload.length === 0) return null;

  const p = payload[0];
  const color = p.color || "hsl(var(--primary) / 0.95)";
  const point = p.payload || {};

  const x = point?.[xKey] ?? point?.x;
  const y = point?.[yKey] ?? point?.y;

  return (
    <div className="rounded-xl border bg-popover/95 p-3 shadow-sm backdrop-blur text-popover-foreground">
      <TooltipRow color={color} label={xLabel} value={formatNumber(x)} />
      <div className="h-2" />
      <TooltipRow color={color} label={yLabel} value={formatNumber(y)} />
    </div>
  );
}

export function ScatterPlot({
  data,
  xKey,
  yKey,
  xLabel,
  yLabel,
  xTooltipLabel,
  yTooltipLabel,
  seriesLabel,
}: Props) {
  if (!data || data.length === 0) {
    return <div className="text-sm text-muted-foreground">No data.</div>;
  }

  const dot = "hsl(var(--primary) / 0.95)";

  const xTip = xTooltipLabel ?? xKey;
  const yTip = yTooltipLabel ?? yKey;

  const name = seriesLabel ?? "Points";

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
              // axis titles OFF unless you pass xLabel
              label={
                xLabel
                  ? {
                      value: xLabel,
                      position: "insideBottom",
                      offset: -6,
                      fill: "hsl(var(--muted-foreground))",
                    }
                  : undefined
              }
            />

            <YAxis
              dataKey={yKey}
              type="number"
              tick={{ fontSize: 12 }}
              width={80}
              tickFormatter={formatNumber}
              // axis titles OFF unless you pass yLabel
              label={
                yLabel
                  ? {
                      value: yLabel,
                      angle: -90,
                      position: "insideLeft",
                      fill: "hsl(var(--muted-foreground))",
                    }
                  : undefined
              }
            />

            <Tooltip
              content={
                <TooltipBox
                  xKey={xKey}
                  yKey={yKey}
                  xLabel={xTip}
                  yLabel={yTip}
                />
              }
            />

            <Legend
              verticalAlign="top"
              align="left"
              iconType="circle"
              wrapperStyle={{ paddingBottom: 8 }}
            />

            <Scatter name={name} data={data} fill={dot} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
