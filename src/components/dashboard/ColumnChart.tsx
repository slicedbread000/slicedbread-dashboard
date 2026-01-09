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
  Legend,
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

function CustomTooltip({
  active,
  label,
  payload,
  seriesLabel,
}: any) {
  if (!active || !payload || payload.length === 0) return null;

  const p0 = payload[0];
  const value = typeof p0?.value === "number" ? p0.value : Number(p0?.value);
  const barColor =
    p0?.payload?.fill || p0?.fill || p0?.color || "hsl(var(--foreground))";

  return (
    <div className="rounded-xl border bg-popover/95 p-3 shadow-sm backdrop-blur text-popover-foreground">
      {/* X-axis label (date) */}
      <div className="mb-2 text-xs text-muted-foreground">{label}</div>

      {/* Dot + label + colored value */}
      <TooltipRow
        color={barColor}
        label={seriesLabel ?? "Value"}
        value={Number.isFinite(value) ? fmtNumber(value) : String(p0?.value ?? "")}
      />
    </div>
  );
}

export function ColumnChart({
  data,
  mode = "default",
  valueLabel,
}: {
  data: Point[];
  mode?: Mode;
  valueLabel?: string;
}) {
  const rows = (data || [])
    .map((d) => ({
      date: String((d as any).date ?? ""),
      value: toNumber((d as any).value),
    }))
    .filter((d) => d.date && Number.isFinite(d.value));

  if (rows.length === 0) {
    return <div className="text-sm text-muted-foreground">No data.</div>;
  }

  const green = "hsl(var(--primary) / 0.90)";
  const red = "hsl(0 75% 55% / 0.85)";

  const shaped = rows.map((r) => {
    let fill = green;
    if (mode === "lossOnly") fill = red;
    if (mode === "posNeg") fill = r.value < 0 ? red : green;
    return { ...r, fill };
  });

  const seriesName = valueLabel ?? "Value";

  return (
    <div className="w-full">
      <div className="w-full aspect-[16/6] min-h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={shaped}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} minTickGap={24} />
            <YAxis tick={{ fontSize: 12 }} width={80} />

            <Tooltip content={<CustomTooltip seriesLabel={seriesName} />} />

            <Legend
              verticalAlign="top"
              align="left"
              iconType="circle"
              wrapperStyle={{ paddingBottom: 8 }}
            />

            <Bar dataKey="value" name={seriesName} radius={[6, 6, 2, 2]}>
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
