"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts";

type Mode = "default" | "lossOnly" | "posNeg";

type Point = {
  date: string;
  value: number;
};

function toNumber(x: any): number {
  if (typeof x === "number") return x;
  const n = Number(String(x ?? "").replace(/[^0-9.\-]/g, ""));
  return Number.isFinite(n) ? n : NaN;
}

export function ColumnChart({
  data,
  mode = "default",
}: {
  data: Point[];
  mode?: Mode;
}) {
  const rows = (data || [])
    .map((d) => ({ date: String(d.date ?? ""), value: toNumber((d as any).value) }))
    .filter((d) => d.date && Number.isFinite(d.value));

  if (rows.length === 0) {
    return <div className="text-sm text-muted-foreground">No data.</div>;
  }

  // Colors (dark theme friendly)
  const green = "hsl(var(--primary) / 0.90)";
  const red = "hsl(0 75% 55% / 0.85)";

  const shaped = rows.map((r) => {
    let fill = green;

    if (mode === "lossOnly") {
      fill = red;
    } else if (mode === "posNeg") {
      fill = r.value < 0 ? red : green;
    }

    return { ...r, fill };
  });

  return (
    <div className="w-full">
      <div className="w-full aspect-[16/6] min-h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={shaped}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} minTickGap={24} />
            <YAxis tick={{ fontSize: 12 }} width={80} />
            <Tooltip
              contentStyle={{
                background: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                color: "hsl(var(--foreground))",
              }}
              labelStyle={{ color: "hsl(var(--foreground))" }}
            />
            <Bar dataKey="value" name="Value" radius={[6, 6, 2, 2]}>
              {shaped.map((entry, idx) => (
                <Cell key={`cell-${idx}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
