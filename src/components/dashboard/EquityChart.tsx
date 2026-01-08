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

type Point = { date: string; equity: number };

export function EquityChart({ data }: { data: Point[] }) {
  // If there's no data, don't render the chart (prevents container warnings too)
  if (!data || data.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        No equity data available (check your equity column names / mapping).
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* aspect-[16/6] gives a stable height */}
      <div className="w-full aspect-[16/6] min-h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} minTickGap={24} />
            <YAxis tick={{ fontSize: 12 }} width={80} />
            <Tooltip />
            <Line type="monotone" dataKey="equity" dot={false} strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
