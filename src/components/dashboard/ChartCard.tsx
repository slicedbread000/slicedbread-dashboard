"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="rounded-2xl border-border/70 bg-card/50 backdrop-blur shadow-[0_0_0_1px_hsl(var(--primary)/0.06)]">
      <CardHeader className="space-y-1">
        <CardTitle className="text-sm font-semibold tracking-tight">{title}</CardTitle>
        {subtitle ? <div className="text-xs text-muted-foreground">{subtitle}</div> : null}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
