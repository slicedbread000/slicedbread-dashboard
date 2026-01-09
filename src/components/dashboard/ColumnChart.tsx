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

function fmtNumber(v: number) {
  // keep it readable without forcing currency
  const abs = Math.abs(v);
  if (abs >= 1000) return v.toLocaleString(undefined, { maximumFractionDigits: 2 });
  return v.toLocaleString(undefined, { maximumFractionDigits: 4 });
}

function CustomTooltip({ active, label, payload }: any) {
  if (!active || !payload || payload.length === 0) return null;

  const p0 = payload[0];
  const value = typeof p0?.value === "number" ? p0.value : Number(p0?.value);
  const barColor =
    p0?.payload?.fill || p0?.fill || p0?.color || "hsl(var(--foreground))";

  return (
    <div
      style={{
        background: "hsl(var(--popover))",
        border: "1px solid hsl(var(--border))",
        color: "hsl(var(--foreground))",
        borderRadius: 12,
        padding: "10px 12px",
      }}
    >
      {/* X axis label stays normal */}
      <div style={{ fontSize: 12, opacity: 0.9, marginBottom: 6 }}>{label}</div>

      {/* Y value matches the bar color */}
      <div style={{ fontSize: 14, fontWeight: 600, color: barColor }}>
        {Number.isFinite(value) ? fmtNumber(value) : String(p0?.value ?? "")}
      </div>
    </div>
  );
}

export function ColumnChart({
  data,
  mode = "default",
}: {
  data: Point[];
  mode?: Mode;
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

  // Colors (dark theme friendly)
  const green = "hsl(var(--primary) / 0.90)";
  const red = "hsl(0 75% 55% / 0.85)";

  const shaped = rows.map((r) => {
    let fill = green;
    if (mode === "lossOnly") fill = red;
    if (mode === "posNeg") fill = r.value < 0 ? red : green;
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
            <Tooltip content={<CustomTooltip />} />
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
