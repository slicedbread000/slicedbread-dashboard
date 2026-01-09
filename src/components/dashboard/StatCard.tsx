"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function StatCard({
  label,
  value,
  hint,
  tone = "neutral",
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  tone?: "neutral" | "good" | "bad";
}) {
  const toneClass =
    tone === "good"
      ? "text-primary"
      : tone === "bad"
      ? "text-[hsl(0_72%_55%)]"
      : "text-foreground";

  return (
    <Card className="rounded-2xl border-border/70 bg-card/50 backdrop-blur shadow-[0_0_0_1px_hsl(var(--primary)/0.06)]">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-medium text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        <div className={cx("text-2xl font-semibold tracking-tight tabular-nums", toneClass)}>
          {value ?? "—"}
        </div>
        {hint ? <div className="text-xs text-muted-foreground">{hint}</div> : null}
      </CardContent>
    </Card>
  );
}
