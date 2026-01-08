import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Kpi = { label: string; value: string; hint?: string };

export function KpiCards({ items }: { items: Kpi[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((k) => (
        <Card key={k.label} className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              {k.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold tracking-tight">{k.value}</div>
            {k.hint ? (
              <div className="mt-1 text-xs text-muted-foreground">{k.hint}</div>
            ) : null}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
