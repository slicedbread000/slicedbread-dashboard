// src/components/dashboard/KpiCard.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { KpiIntent } from "@/lib/kpi";

type Props = {
  label: string;
  value: React.ReactNode;
  intent?: KpiIntent; // "good" | "bad" | "neutral"
  hint?: string; // optional small text under value
};

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function KpiCard({ label, value, intent = "neutral", hint }: Props) {
  const valueClass =
    intent === "good"
      ? "text-emerald-300"
      : intent === "bad"
      ? "text-rose-300"
      : "text-foreground";

  const dotClass =
    intent === "good"
      ? "bg-emerald-400/90 shadow-[0_0_0_4px_rgba(16,185,129,0.12)]"
      : intent === "bad"
      ? "bg-rose-400/90 shadow-[0_0_0_4px_rgba(244,63,94,0.12)]"
      : "bg-muted-foreground/40 shadow-[0_0_0_4px_rgba(148,163,184,0.10)]";

  return (
    <Card className="rounded-2xl border-border/70 bg-card/40 backdrop-blur">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
          <span className={cx("h-2 w-2 rounded-full", dotClass)} />
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={cx("text-2xl font-semibold tracking-tight tabular-nums", valueClass)}>
          {value}
        </div>
        {hint ? <div className="mt-1 text-xs text-muted-foreground">{hint}</div> : null}
      </CardContent>
    </Card>
  );
}
