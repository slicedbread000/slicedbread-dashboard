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

type Point = { date: string; networth: number };

function toNumber(x: any): number {
  if (typeof x === "number") return x;
  const n = Number(String(x ?? "").replace(/[^0-9.\-]/g, ""));
  return Number.isFinite(n) ? n : NaN;
}

function fmtNumber(v: number) {
  const abs = Math.abs(v);
  if (abs >= 1000) return v.toLocaleString(undefined, { maximumFractionDigits: 2 });
  return v.toLocaleString(undefined, { maximumFractionDigits: 4 });
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
      <span className="font-medium tabular-nums" style={{ color }}>
        {value}
      </span>
    </div>
  );
}

function CustomTooltip({ active, label, payload }: any) {
  if (!active || !payload || payload.length === 0) return null;

  const p0 = payload[0];
  const color = p0.color || "hsl(var(--primary) / 0.95)";
  const v = toNumber(p0.value);

  return (
    <div className="rounded-xl border bg-popover/95 p-3 shadow-sm backdrop-blur text-popover-foreground">
      <div className="mb-2 text-xs text-muted-foreground">{label}</div>
      <TooltipRow
        color={color}
        label={p0.name ?? "Net Worth"}
        value={Number.isFinite(v) ? fmtNumber(v) : String(p0.value ?? "")}
      />
    </div>
  );
}

export function NetWorthChart({ data }: { data: Point[] }) {
  if (!data || data.length === 0) {
    return <div className="text-sm text-muted-foreground">No net worth data.</div>;
  }

  // Tight Y-domain with padding (prevents "straight line" feel)
  const ys = data.map((d) => toNumber((d as any).networth)).filter((n) => Number.isFinite(n)) as number[];
  const min = Math.min(...ys);
  const max = Math.max(...ys);
  const span = Math.max(1, max - min);
  const pad = span * 0.08;

  const domain: [number, number] = [min - pad, max + pad];

  const stroke = "hsl(var(--primary) / 0.95)";
  const seriesName = "Net Worth";

  return (
    <div className="w-full">
      <div className="w-full aspect-[16/6] min-h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} minTickGap={24} />
            <YAxis tick={{ fontSize: 12 }} width={80} domain={domain} />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              align="left"
              iconType="circle"
              wrapperStyle={{ paddingBottom: 8 }}
            />
            <Line
              type="monotone"
              name={seriesName}
              dataKey="networth"
              dot={false}
              strokeWidth={2.2}
              stroke={stroke}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
