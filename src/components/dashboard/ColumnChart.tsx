"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

type Point = { date: string; value: number };

type Props = {
  data: Point[];
  mode?: "default" | "profitLoss" | "lossOnly";
};

function num(x: any): number | null {
  const n = typeof x === "number" ? x : Number(String(x ?? "").replace(/[^0-9.\-]/g, ""));
  return Number.isFinite(n) ? n : null;
}

function formatNumber(v: any) {
  const n = num(v);
  if (n === null) return "";
  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: Math.abs(n) < 1 ? 4 : 2,
  }).format(n);
}

function TooltipBox({ active, payload, label }: any) {
  if (!active || !payload || payload.length === 0) return null;
  const p = payload[0];
  const color = p.color;

  return (
    <div className="rounded-xl border bg-popover/95 p-3 shadow-sm backdrop-blur text-popover-foreground">
      <div className="mb-2 text-xs text-muted-foreground">{label}</div>
      <div className="flex items-center justify-between gap-6 text-sm">
        <span className="text-muted-foreground">{p.name ?? "Value"}</span>
        <span style={{ color }} className="font-medium tabular-nums">
          {formatNumber(p.value)}
        </span>
      </div>
    </div>
  );
}

export function ColumnChart({ data, mode = "default" }: Props) {
  if (!data || data.length === 0) {
    return <div className="text-sm text-muted-foreground">No data.</div>;
  }

  const green = "hsl(var(--primary) / 0.95)";
  const red = "hsl(0 70% 55% / 0.90)";

  const shaped = data.map((d) => ({
    ...d,
    fill:
      mode === "lossOnly" ? red : mode === "profitLoss" ? (d.value >= 0 ? green : red) : green,
  }));

  return (
    <div className="w-full">
      <div className="w-full aspect-[16/6] min-h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={shaped}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.18} />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} minTickGap={24} />
            <YAxis tick={{ fontSize: 12 }} width={80} tickFormatter={formatNumber} />
            <Tooltip content={<TooltipBox />} />
            <Bar dataKey="value" name="Value" radius={[6, 6, 2, 2]} fill={green}>
              {shaped.map((entry, idx) => (
                <cell key={`cell-${idx}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
