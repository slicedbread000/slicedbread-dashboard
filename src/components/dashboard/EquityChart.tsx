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

type Point = { date: string; equity: number };

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
      <span style={{ color }} className="font-medium tabular-nums">
        {value}
      </span>
    </div>
  );
}

function TooltipBox({ active, payload, label }: any) {
  if (!active || !payload || payload.length === 0) return null;

  const p = payload[0];
  const color = p.color || "hsl(var(--primary) / 0.95)";
  const name = p.name ?? "Value";

  return (
    <div className="rounded-xl border bg-popover/95 p-3 shadow-sm backdrop-blur text-popover-foreground">
      <div className="mb-2 text-xs text-muted-foreground">{label}</div>
      <TooltipRow color={color} label={name} value={formatNumber(p.value)} />
    </div>
  );
}

export function EquityChart({ data }: { data: Point[] }) {
  if (!data || data.length === 0) {
    return <div className="text-sm text-muted-foreground">No data.</div>;
  }

  const stroke = "hsl(var(--primary) / 0.95)";
  const seriesName = "Value";

  return (
    <div className="w-full">
      <div className="w-full aspect-[16/6] min-h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.18} />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} minTickGap={24} />
            <YAxis tick={{ fontSize: 12 }} width={80} tickFormatter={formatNumber} />

            <Tooltip content={<TooltipBox />} />

            <Legend
              verticalAlign="top"
              align="left"
              iconType="circle"
              wrapperStyle={{ paddingBottom: 8 }}
            />

            <Line
              type="monotone"
              dataKey="equity"
              name={seriesName}
              dot={false}
              strokeWidth={2.4}
              stroke={stroke}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

