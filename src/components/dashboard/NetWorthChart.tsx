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

type Props = {
  data: Point[];
  format?: "number" | "currency";
  currency?: string;
};

function num(x: any): number | null {
  const n =
    typeof x === "number" ? x : Number(String(x ?? "").replace(/[^0-9.\-]/g, ""));
  return Number.isFinite(n) ? n : null;
}

function formatValue(v: any, format: "number" | "currency", currency: string) {
  const n = num(v);
  if (n === null) return "";

  if (format === "currency") {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(n);
  }

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
        <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: color }} />
        <span className="text-muted-foreground">{label}</span>
      </div>
      <span style={{ color }} className="font-medium tabular-nums">
        {value}
      </span>
    </div>
  );
}

function TooltipBox({ active, payload, label, format, currency }: any) {
  if (!active || !payload || payload.length === 0) return null;
  const p = payload[0];
  const color = p.color || "hsl(var(--primary) / 0.95)";

  return (
    <div className="rounded-xl border bg-popover/95 p-3 shadow-sm backdrop-blur text-popover-foreground">
      <div className="mb-2 text-xs text-muted-foreground">{label}</div>
      <TooltipRow
        color={color}
        label={p.name ?? "Net Worth"}
        value={formatValue(p.value, format, currency)}
      />
    </div>
  );
}

export function NetWorthChart({ data, format = "number", currency = "USD" }: Props) {
  if (!data || data.length === 0) {
    return <div className="text-sm text-muted-foreground">No net worth data.</div>;
  }

  // tight y-axis domain with padding
  const values = data.map((d) => d.networth).filter((v) => Number.isFinite(v)) as number[];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;
  const pad = range > 0 ? range * 0.02 : Math.max(Math.abs(max) * 0.01, 1);
  const yDomain: [number, number] = [min - pad, max + pad];

  const tickFormatter = (v: any) => formatValue(v, format, currency);

  return (
    <div className="w-full">
      <div className="w-full aspect-[16/6] min-h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.18} />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} minTickGap={24} />
            <YAxis
              tick={{ fontSize: 12 }}
              width={92}
              tickFormatter={tickFormatter}
              domain={yDomain}
            />
            <Tooltip content={<TooltipBox format={format} currency={currency} />} />
            <Line
              type="monotone"
              dataKey="networth"
              name="Net Worth"
              dot={false}
              strokeWidth={2.4}
              stroke="hsl(var(--primary) / 0.95)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
