import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Props = {
  label: string;
  value: string | number | null | undefined;
  hint?: string;
};

export function KpiCard({ label, value, hint }: Props) {
  return (
    <Card className="rounded-2xl border-border/70 bg-card/40 backdrop-blur">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-medium text-muted-foreground">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold tracking-tight">
          {value ?? "—"}
        </div>
        {hint ? (
          <div className="mt-1 text-xs text-muted-foreground">{hint}</div>
        ) : null}
      </CardContent>
    </Card>
  );
}
