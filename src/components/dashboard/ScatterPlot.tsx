"use client";

import {
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ScatterChart,
  Scatter,
} from "recharts";

function extent(data: any[], key: string): [number, number] | null {
  let min = Infinity;
  let max = -Infinity;
  for (const r of data) {
    const v = r?.[key];
    if (typeof v !== "number" || !Number.isFinite(v)) continue;
    if (v < min) min = v;
    if (v > max) max = v;
  }
  if (!Number.isFinite(min) || !Number.isFinite(max)) return null;
  if (min === max) return [min - 1, max + 1];
  const pad = (max - min) * 0.08;
  return [min - pad, max + pad];
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

  const xDom = extent(data, xKey) ?? ["auto", "auto"];
  const yDom = extent(data, yKey) ?? ["auto", "auto"];

  return (
    <div className="w-full">
      <div className="w-full aspect-[16/6] min-h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
            <XAxis dataKey={xKey} tick={{ fontSize: 12 }} type="number" domain={xDom as any} />
            <YAxis dataKey={yKey} tick={{ fontSize: 12 }} width={80} type="number" domain={yDom as any} />
            <Tooltip />
            <Scatter data={data} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
