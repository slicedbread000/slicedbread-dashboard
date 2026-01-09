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

type Datum = { date: string; value: number };

export type Mode = "default" | "lossOnly" | "profitLoss";

type Props = {
  data: Datum[];
  mode?: Mode;
  name?: string; // label in tooltip
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

function TooltipBox({ active, payload, label, name }: any) {
  if (!active || !payload || payload.length === 0) return null;

  const p = payload[0];

  // IMPORTANT:
  // With per-bar coloring via <Cell fill=...>, the real color is on p.payload.fill
  const color =
    p?.payload?.fill ||
    p?.color ||
    "hsl(var(--primary) / 0.95)";

  return (
    <div className="rounded-xl border bg-popover/95 p-3 shadow-sm backdrop-blur text-popover-foreground">
      <div className="mb-2 text-xs text-muted-foreground">{label}</div>
      <TooltipRow
        color={color}
        label={name ?? p.name ?? "Value"}
        value={formatNumber(p.value)}
      />
    </div>
  );
}

export function ColumnChart({ data, mode = "default", name = "Value" }: Props) {
  if (!data || data.length === 0) {
    return <div className="text-sm text-muted-foreground">No data.</div>;
  }

  const green = "hsl(var(--primary) / 0.95)";
  const red = "hsl(0 72% 45% / 0.95)";

  const shaped = data.map((d) => {
    const v = typeof d.value === "number" ? d.value : Number(d.value);
    let fill = green;

    if (mode === "lossOnly") fill = red;
    if (mode === "profitLoss") fill = v < 0 ? red : green;

    return { ...d, fill };
  });

  return (
    <div className="w-full">
      <div className="w-full aspect-[16/6] min-h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={shaped}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.18} />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} minTickGap={24} />
            <YAxis tick={{ fontSize: 12 }} width={80} tickFormatter={formatNumber} />
            <Tooltip content={<TooltipBox name={name} />} />
            <Bar dataKey="value" name={name} radius={[6, 6, 2, 2]}>
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
