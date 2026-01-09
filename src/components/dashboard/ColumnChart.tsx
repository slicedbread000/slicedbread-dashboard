"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";

function hsl(varName: string, alpha = 1) {
  return `hsl(var(${varName}) / ${alpha})`;
}

export function ColumnChart({
  data,
  mode = "single",
}: {
  data: { date: string; value: number }[];
  mode?: "single" | "profitLoss" | "lossOnly";
}) {
  if (!data || data.length === 0) {
    return <div className="text-sm text-muted-foreground">No data.</div>;
  }

  const posFill = hsl("--primary", 0.70);
  const posStroke = hsl("--primary", 0.95);

  const negFill = "hsl(0 70% 35% / 0.70)";     // dark red
  const negStroke = "hsl(0 70% 55% / 0.85)";  // readable red

  const lossFill = "hsl(0 70% 35% / 0.75)";
  const lossStroke = "hsl(0 70% 55% / 0.85)";

  return (
    <div className="w-full">
      <div className="w-full aspect-[16/6] min-h-[260px] rounded-xl border border-border/70 bg-card/30 p-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 12, left: 8, bottom: 6 }}>
            <CartesianGrid stroke={hsl("--border", 0.35)} strokeDasharray="3 6" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12, fill: hsl("--muted-foreground", 0.95) }}
              axisLine={{ stroke: hsl("--border", 0.55) }}
              tickLine={{ stroke: hsl("--border", 0.55) }}
              minTickGap={26}
            />
            <YAxis
              tick={{ fontSize: 12, fill: hsl("--muted-foreground", 0.95) }}
              axisLine={{ stroke: hsl("--border", 0.55) }}
              tickLine={{ stroke: hsl("--border", 0.55) }}
              width={84}
            />
            <Tooltip
              cursor={{ fill: hsl("--primary", 0.06) }}
              contentStyle={{
                background: hsl("--card", 0.98),
                border: `1px solid ${hsl("--border", 0.85)}`,
                borderRadius: 12,
                color: hsl("--foreground", 0.98),
                boxShadow: `0 12px 28px ${hsl("--background", 0.45)}`,
              }}
              labelStyle={{ color: hsl("--muted-foreground", 0.95) }}
              itemStyle={{ color: hsl("--foreground", 0.98) }}
            />

            <Bar dataKey="value" radius={[6, 6, 2, 2]}>
              {data.map((d, i) => {
                const v = Number(d.value);
                const isNeg = Number.isFinite(v) && v < 0;

                if (mode === "lossOnly") {
                  return <Cell key={i} fill={lossFill} stroke={lossStroke} />;
                }

                if (mode === "profitLoss") {
                  return <Cell key={i} fill={isNeg ? negFill : posFill} stroke={isNeg ? negStroke : posStroke} />;
                }

                return <Cell key={i} fill={posFill} stroke={posStroke} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
